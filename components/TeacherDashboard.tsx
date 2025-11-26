
import React, { useState } from 'react';
import { Card, Button } from './Shared';
import { X, Download, Trophy, Users, Star, Award, LayoutDashboard, List } from 'lucide-react';
import { playSound } from '../services/soundService';

interface TeacherDashboardProps {
  onClose: () => void;
}

// Mock Data to simulate a classroom environment
const MOCK_STUDENTS = [
  { id: 1, name: "Emma", avatar: "Aneka", score: 2450, gamesPlayed: 15, topMode: "Emoji Challenge", accuracy: "92%" },
  { id: 2, name: "Liam", avatar: "Felix", score: 1890, gamesPlayed: 12, topMode: "Fix the Mistake", accuracy: "85%" },
  { id: 3, name: "Noah", avatar: "Jack", score: 3100, gamesPlayed: 20, topMode: "Speed Challenge", accuracy: "78%" },
  { id: 4, name: "Olivia", avatar: "Molly", score: 1200, gamesPlayed: 8, topMode: "Guess the Prompt", accuracy: "65%" },
  { id: 5, name: "Ava", avatar: "Jocelyn", score: 2150, gamesPlayed: 14, topMode: "Emoji Challenge", accuracy: "88%" },
  { id: 6, name: "Ethan", avatar: "Christopher", score: 2800, gamesPlayed: 18, topMode: "Speed Challenge", accuracy: "82%" },
  { id: 7, name: "Sophia", avatar: "Willow", score: 1500, gamesPlayed: 10, topMode: "Fix the Mistake", accuracy: "70%" },
];

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'students'>('overview');

  const handleExport = () => {
    playSound('click');
    alert("Class Report downloaded as .CSV! (Simulation)");
  };

  const handleClose = () => {
    playSound('click');
    onClose();
  };

  const handleTabChange = (tab: 'overview' | 'students') => {
    playSound('click');
    setActiveTab(tab);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center shadow-md z-10">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
              <Users size={28} className="text-indigo-100" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Teacher Dashboard</h2>
              <p className="text-indigo-200 text-sm font-medium">Classroom: Grade 4 - Mrs. Frizzle</p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-100 px-6 pt-4 flex gap-6">
          <button
            onClick={() => handleTabChange('overview')}
            className={`pb-3 px-2 text-sm font-bold uppercase tracking-wide flex items-center gap-2 border-b-4 transition-colors ${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            <LayoutDashboard size={18} /> Overview
          </button>
          <button
            onClick={() => handleTabChange('students')}
            className={`pb-3 px-2 text-sm font-bold uppercase tracking-wide flex items-center gap-2 border-b-4 transition-colors ${activeTab === 'students' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            <List size={18} /> Student List
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
          
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white border-l-4 border-indigo-500 !p-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                       <Users size={24} />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Active Students</p>
                      <p className="text-3xl font-black text-gray-800">24</p>
                    </div>
                  </div>
                </Card>
                <Card className="bg-white border-l-4 border-green-500 !p-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-full text-green-600">
                       <Trophy size={24} />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Total Class Score</p>
                      <p className="text-3xl font-black text-gray-800">14,250</p>
                    </div>
                  </div>
                </Card>
                <Card className="bg-white border-l-4 border-yellow-500 !p-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
                       <Star size={24} />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Avg. Creativity</p>
                      <p className="text-3xl font-black text-gray-800">88%</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Recent Activity / Highlights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Award className="text-orange-500" size={20} /> Class Top Performers
                    </h3>
                    <div className="space-y-3">
                      {MOCK_STUDENTS.slice(0, 3).map((s, i) => (
                        <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                             <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-xs">{i+1}</div>
                             <span className="font-bold text-gray-700">{s.name}</span>
                          </div>
                          <span className="font-mono font-bold text-indigo-600">{s.score} pts</span>
                        </div>
                      ))}
                    </div>
                 </div>

                 <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                      <h3 className="font-bold text-xl mb-2">Weekly Challenge</h3>
                      <p className="text-indigo-100 mb-4">The "Underwater City" challenge ends in 2 days.</p>
                      <div className="w-full bg-black/20 rounded-full h-3 mb-1">
                        <div className="bg-yellow-400 h-3 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <p className="text-xs text-indigo-200 font-bold text-right">65% Participation</p>
                    </div>
                    <Star className="absolute -bottom-4 -right-4 text-white/10 w-32 h-32 rotate-12" />
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in slide-in-from-right-4 duration-300">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-700 flex items-center gap-2">
                  <List size={18} className="text-indigo-500" />
                  All Students
                </h3>
                <Button size="sm" variant="secondary" onClick={handleExport} icon={<Download size={16} />}>
                  Export CSV
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider text-left">
                    <tr>
                      <th className="p-4 pl-6">Student</th>
                      <th className="p-4">Total Score</th>
                      <th className="p-4 hidden sm:table-cell">Games Played</th>
                      <th className="p-4 hidden md:table-cell">Favorite Mode</th>
                      <th className="p-4 hidden sm:table-cell">Accuracy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {MOCK_STUDENTS.map((student) => (
                      <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors group">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                               <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${student.name}`} alt={student.name} />
                            </div>
                            <span className="font-bold text-gray-800">{student.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                            {student.score} pts
                          </span>
                        </td>
                        <td className="p-4 hidden sm:table-cell text-gray-600 font-medium">{student.gamesPlayed}</td>
                        <td className="p-4 hidden md:table-cell">
                          <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded-md border border-sky-100">
                            {student.topMode}
                          </span>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                             <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                               <div className="h-full bg-green-500 rounded-full" style={{ width: student.accuracy }}></div>
                             </div>
                             <span className="text-xs font-bold text-gray-500">{student.accuracy}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
