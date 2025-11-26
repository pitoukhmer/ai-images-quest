
import React, { useState, useEffect, useRef } from 'react';
import { PeerStream } from '../types';
import { WebRTCManager } from '../services/webrtcService';
import { Button, Input, Card } from './Shared';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Users, Copy } from 'lucide-react';
import { playSound } from '../services/soundService';

interface LiveVideoRoomProps {
  userName: string;
  onClose: () => void;
}

export const LiveVideoRoom: React.FC<LiveVideoRoomProps> = ({ userName, onClose }) => {
  const [roomId, setRoomId] = useState('');
  const [joined, setJoined] = useState(false);
  const [peers, setPeers] = useState<PeerStream[]>([]);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const webRTC = useRef<WebRTCManager | null>(null);
  const myPeerId = useRef(Math.random().toString(36).substr(2, 9));
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      webRTC.current?.leaveRoom();
    };
  }, []);

  const handleJoin = async () => {
    if (!roomId.trim()) return;
    setError(null);
    playSound('click');

    try {
      const manager = new WebRTCManager(
        myPeerId.current,
        (peer) => {
          setPeers(prev => {
             // prevent duplicates
             if (prev.find(p => p.id === peer.id)) return prev;
             playSound('pop');
             return [...prev, peer];
          });
        },
        (peerId) => {
          setPeers(prev => prev.filter(p => p.id !== peerId));
        }
      );

      const stream = await manager.startLocalStream();
      webRTC.current = manager;
      
      // Add self to peers list for rendering
      setPeers([{ id: 'me', stream, isSelf: true }]);
      
      manager.joinRoom(roomId);
      setJoined(true);
      playSound('success');

    } catch (err) {
      console.error(err);
      setError("Could not access camera/mic. Please allow permissions.");
      playSound('error');
    }
  };

  const handleToggleMic = () => {
    webRTC.current?.toggleAudio(!isMicOn);
    setIsMicOn(!isMicOn);
    playSound('click');
  };

  const handleToggleCam = () => {
    webRTC.current?.toggleVideo(!isCamOn);
    setIsCamOn(!isCamOn);
    playSound('click');
  };

  const handleLeave = () => {
    webRTC.current?.leaveRoom();
    setJoined(false);
    setPeers([]);
    onClose();
    playSound('click');
  };

  // Render Lobby
  if (!joined) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-sky-50 rounded-3xl border-4 border-sky-100">
        <div className="bg-white p-8 rounded-3xl shadow-lg text-center max-w-sm w-full">
          <div className="bg-sky-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-sky-600" />
          </div>
          <h3 className="text-2xl font-black text-gray-800 mb-2">Live Party!</h3>
          <p className="text-gray-500 mb-6">Enter a Room ID to video chat with friends while you play.</p>
          
          {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded-lg">{error}</p>}

          <div className="space-y-3">
             <Input 
                placeholder="Room Name (e.g. 'FunRoom')" 
                value={roomId} 
                onChange={(e) => setRoomId(e.target.value)}
             />
             <Button className="w-full" onClick={handleJoin} icon={<Video />}>
               Join Room
             </Button>
             <p className="text-xs text-gray-400 mt-2">
               *Works best in two tabs on the same computer for testing.
             </p>
          </div>
        </div>
      </div>
    );
  }

  // Render Connected Room
  return (
    <div className="h-full flex flex-col bg-gray-900 rounded-3xl overflow-hidden relative border-4 border-gray-800">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-md p-3 flex justify-between items-center absolute top-0 left-0 right-0 z-10">
         <div className="flex items-center gap-2 text-white">
           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
           <span className="font-bold text-sm">Room: {roomId}</span>
         </div>
         <div className="text-white/50 text-xs font-mono">{peers.length} Online</div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 auto-rows-min gap-3 content-center">
        {peers.map((peer) => (
          <VideoPlayer key={peer.id} peer={peer} />
        ))}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex justify-center gap-4 items-center">
        <button 
          onClick={handleToggleMic}
          className={`p-3 rounded-full transition-colors ${isMicOn ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-red-500 text-white'}`}
        >
          {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        
        <button 
          onClick={handleLeave}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg transform active:scale-95 transition-all"
        >
          Leave
        </button>

        <button 
          onClick={handleToggleCam}
          className={`p-3 rounded-full transition-colors ${isCamOn ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-red-500 text-white'}`}
        >
          {isCamOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
      </div>
    </div>
  );
};

const VideoPlayer: React.FC<{ peer: PeerStream }> = ({ peer }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && peer.stream) {
      videoRef.current.srcObject = peer.stream;
    }
  }, [peer.stream]);

  return (
    <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border-2 border-white/10 group">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted={peer.isSelf} // Mute self to prevent echo
        className={`w-full h-full object-cover ${peer.isSelf ? 'scale-x-[-1]' : ''}`} 
      />
      <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-md text-white text-xs font-bold">
        {peer.isSelf ? "You" : "Player"}
      </div>
      <div className="absolute inset-0 border-4 border-transparent group-hover:border-white/20 transition-colors rounded-2xl pointer-events-none"></div>
    </div>
  );
};
