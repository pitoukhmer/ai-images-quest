
import { PeerStream } from '../types';

// We use BroadcastChannel for signaling between tabs on the same browser/origin.
// In a real production app, this would use WebSockets or Firebase.
const CHANNEL_NAME = 'ai_quest_signaling';

interface SignalMessage {
  type: 'join' | 'offer' | 'answer' | 'candidate' | 'leave';
  roomId: string;
  peerId: string;
  targetPeerId?: string;
  payload?: any;
}

export class WebRTCManager {
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private signalingChannel: BroadcastChannel;
  private onStreamCallback: (stream: PeerStream) => void;
  private onPeerLeaveCallback: (peerId: string) => void;
  private myPeerId: string;
  private currentRoomId: string | null = null;

  constructor(
    myPeerId: string,
    onStream: (stream: PeerStream) => void,
    onPeerLeave: (peerId: string) => void
  ) {
    this.myPeerId = myPeerId;
    this.onStreamCallback = onStream;
    this.onPeerLeaveCallback = onPeerLeave;
    this.signalingChannel = new BroadcastChannel(CHANNEL_NAME);
    
    this.signalingChannel.onmessage = this.handleSignalMessage.bind(this);
  }

  public async startLocalStream(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240 }, 
        audio: true 
      });
      this.localStream = stream;
      return stream;
    } catch (err) {
      console.error("Error accessing media devices:", err);
      throw err;
    }
  }

  public joinRoom(roomId: string) {
    this.currentRoomId = roomId;
    // Announce presence
    this.sendSignal('join', { });
  }

  public leaveRoom() {
    this.sendSignal('leave', {});
    this.cleanup();
  }

  public toggleAudio(enabled: boolean) {
    this.localStream?.getAudioTracks().forEach(track => track.enabled = enabled);
  }

  public toggleVideo(enabled: boolean) {
    this.localStream?.getVideoTracks().forEach(track => track.enabled = enabled);
  }

  private cleanup() {
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }
    this.currentRoomId = null;
  }

  private sendSignal(type: SignalMessage['type'], payload: any, targetPeerId?: string) {
    if (!this.currentRoomId) return;
    const message: SignalMessage = {
      type,
      roomId: this.currentRoomId,
      peerId: this.myPeerId,
      targetPeerId,
      payload
    };
    this.signalingChannel.postMessage(message);
  }

  private async handleSignalMessage(event: MessageEvent<SignalMessage>) {
    const msg = event.data;

    // Filter: Must be same room, not from self
    if (msg.roomId !== this.currentRoomId || msg.peerId === this.myPeerId) return;
    
    // If message is targeted, ensure it is for me
    if (msg.targetPeerId && msg.targetPeerId !== this.myPeerId) return;

    switch (msg.type) {
      case 'join':
        // Someone joined. I should initiate a connection with them.
        this.createPeerConnection(msg.peerId, true);
        break;
      
      case 'offer':
        await this.handleOffer(msg.peerId, msg.payload);
        break;
      
      case 'answer':
        await this.handleAnswer(msg.peerId, msg.payload);
        break;
      
      case 'candidate':
        await this.handleCandidate(msg.peerId, msg.payload);
        break;

      case 'leave':
        this.handlePeerLeave(msg.peerId);
        break;
    }
  }

  private async createPeerConnection(remotePeerId: string, isInitiator: boolean) {
    if (this.peerConnections.has(remotePeerId)) return;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    this.peerConnections.set(remotePeerId, pc);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal('candidate', event.candidate, remotePeerId);
      }
    };

    pc.ontrack = (event) => {
      this.onStreamCallback({
        id: remotePeerId,
        stream: event.streams[0],
        isSelf: false
      });
    };

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        if (this.localStream) pc.addTrack(track, this.localStream);
      });
    }

    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      this.sendSignal('offer', offer, remotePeerId);
    }
  }

  private async handleOffer(remotePeerId: string, offer: RTCSessionDescriptionInit) {
    // If we receive an offer, we are not the initiator for this specific peer connection logic
    await this.createPeerConnection(remotePeerId, false);
    const pc = this.peerConnections.get(remotePeerId);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.sendSignal('answer', answer, remotePeerId);
    }
  }

  private async handleAnswer(remotePeerId: string, answer: RTCSessionDescriptionInit) {
    const pc = this.peerConnections.get(remotePeerId);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  private async handleCandidate(remotePeerId: string, candidate: RTCIceCandidateInit) {
    const pc = this.peerConnections.get(remotePeerId);
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  private handlePeerLeave(remotePeerId: string) {
    const pc = this.peerConnections.get(remotePeerId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(remotePeerId);
      this.onPeerLeaveCallback(remotePeerId);
    }
  }
}
