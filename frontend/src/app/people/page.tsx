'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UsersIcon, PlusIcon, HeartIcon, BriefcaseIcon, HomeIcon, UserIcon, CalendarIcon, SparklesIcon, EditIcon, TrashIcon, XIcon } from 'lucide-react';
import { AppNavbar } from '@/components/navigation/app-navbar';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { FloatingOrbs } from '@/components/ui/floating-orbs';
import { AmbientParticles } from '@/components/ui/ambient-particles';
import { MagneticCard } from '@/components/ui/magnetic-card';
import { peopleAPI, numerologyAPI } from '@/lib/numerology-api';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { Person as APIPerson } from '@/lib/numerology-api';

interface Person {
  id: string;
  name: string;
  birthDate: string;
  relationship: 'family' | 'friend' | 'partner' | 'colleague' | 'other';
  lifePathNumber?: number;
  personalYear?: number;
  compatibility?: number;
}

export default function PeopleManager() {
  const router = useRouter();
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newPerson, setNewPerson] = useState({
    name: '',
    birthDate: '',
    relationship: 'friend' as const
  });
  const [people, setPeople] = useState<Person[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchPeople();
  }, [user, router]);

  const fetchPeople = async () => {
    try {
      setLoading(true);
      const apiPeople = await peopleAPI.getPeople();
      
      // Transform API people to local format
      const transformedPeople: Person[] = await Promise.all(
        apiPeople.map(async (person: APIPerson) => {
          let lifePathNumber: number | undefined;
          let personalYear: number | undefined;
          
          try {
            const profile = await peopleAPI.getPersonNumerologyProfile(person.id);
            if (profile) {
              lifePathNumber = profile.life_path_number;
              personalYear = profile.personal_year_number;
            }
          } catch (error) {
            // Profile not calculated yet
          }
          
          return {
            id: person.id,
            name: person.name,
            birthDate: person.birth_date,
            relationship: person.relationship as any,
            lifePathNumber,
            personalYear,
            compatibility: undefined // Would need compatibility API
          };
        })
      );
      
      setPeople(transformedPeople);
    } catch (error) {
      console.error('Failed to fetch people:', error);
      toast.error('Failed to load people');
      setPeople([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const relationshipIcons = {
    family: <HomeIcon className="w-5 h-5" />,
    friend: <UsersIcon className="w-5 h-5" />,
    partner: <HeartIcon className="w-5 h-5" />,
    colleague: <BriefcaseIcon className="w-5 h-5" />,
    other: <UserIcon className="w-5 h-5" />
  };
  const relationshipColors = {
    family: 'from-blue-500 to-cyan-500',
    friend: 'from-green-500 to-emerald-500',
    partner: 'from-pink-500 to-rose-500',
    colleague: 'from-purple-500 to-indigo-500',
    other: 'from-gray-500 to-slate-500'
  };
  const handleAddPerson = () => {
    if (newPerson.name && newPerson.birthDate) {
      const person: Person = {
        id: Date.now().toString(),
        name: newPerson.name,
        birthDate: newPerson.birthDate,
        relationship: newPerson.relationship,
        lifePathNumber: Math.floor(Math.random() * 9) + 1,
        personalYear: Math.floor(Math.random() * 9) + 1,
        compatibility: Math.floor(Math.random() * 30) + 70
      };
      setPeople([...people, person]);
      setNewPerson({
        name: '',
        birthDate: '',
        relationship: 'friend'
      });
      setShowAddModal(false);
    }
  };
  const handleDeletePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
  };
  return <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-950 transition-colors duration-500 flex flex-col relative overflow-hidden">
      <AmbientParticles />
      <FloatingOrbs />
      <AppNavbar />

      <main className="flex-1 section-spacing px-4 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-white dark:via-purple-300 dark:to-blue-300 bg-clip-text text-transparent">
                My People
              </h1>
              <p className="text-lg text-gray-600 dark:text-white/70">
                Manage and explore numerology profiles of people in your life
              </p>
            </div>
            <GlassButton variant="liquid" size="lg" icon={<PlusIcon className="w-5 h-5" />} onClick={() => setShowAddModal(true)} className="glass-glow">
              Add Person
            </GlassButton>
          </motion.div>

          {/* People Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {people.map((person, index) => <motion.div key={person.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.1
          }}>
                <MagneticCard variant="liquid" className="card-padding h-full">
                  <div className="liquid-glass-content">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${relationshipColors[person.relationship]} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                        {relationshipIcons[person.relationship]}
                      </div>
                      <div className="flex gap-2">
                        <motion.button className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors" whileHover={{
                      scale: 1.1
                    }} whileTap={{
                      scale: 0.95
                    }}>
                          <EditIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </motion.button>
                        <motion.button onClick={() => handleDeletePerson(person.id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors" whileHover={{
                      scale: 1.1
                    }} whileTap={{
                      scale: 0.95
                    }}>
                          <TrashIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Info */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {person.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-white/70 mb-4 capitalize">
                      {person.relationship}
                    </p>

                    {/* Stats */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Life Path
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {person.lifePathNumber}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Personal Year
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {person.personalYear}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Compatibility
                        </span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {person.compatibility}%
                        </span>
                      </div>
                    </div>

                    {/* Birth Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        {new Date(person.birthDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                      </span>
                    </div>

                    {/* Action Button */}
                    <GlassButton variant="secondary" size="sm" className="w-full" icon={<SparklesIcon className="w-4 h-4" />}>
                      View Full Profile
                    </GlassButton>
                  </div>
                </MagneticCard>
              </motion.div>)}
          </div>

          {/* Empty State */}
          {people.length === 0 && <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="text-center py-16">
              <MagneticCard variant="liquid-premium" className="card-padding-lg max-w-md mx-auto">
                <div className="liquid-glass-content">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center text-white mb-6 mx-auto shadow-xl">
                    <UsersIcon className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    No People Added Yet
                  </h3>
                  <p className="text-gray-600 dark:text-white/70 mb-6">
                    Start building your numerology network by adding people in
                    your life
                  </p>
                  <GlassButton variant="liquid" size="lg" icon={<PlusIcon className="w-5 h-5" />} onClick={() => setShowAddModal(true)} className="glass-glow">
                    Add Your First Person
                  </GlassButton>
                </div>
              </MagneticCard>
            </motion.div>}
        </div>
      </main>

      {/* Add Person Modal */}
      <AnimatePresence>
        {showAddModal && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
            <motion.div initial={{
          opacity: 0,
          scale: 0.9,
          y: 20
        }} animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }} exit={{
          opacity: 0,
          scale: 0.9,
          y: 20
        }} onClick={e => e.stopPropagation()} className="w-full max-w-md">
              <MagneticCard variant="liquid-premium" className="card-padding-lg">
                <div className="liquid-glass-content">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Add New Person
                    </h3>
                    <motion.button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors" whileHover={{
                  scale: 1.1
                }} whileTap={{
                  scale: 0.95
                }}>
                      <XIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </motion.button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Name
                      </label>
                      <input type="text" value={newPerson.name} onChange={e => setNewPerson({
                    ...newPerson,
                    name: e.target.value
                  })} placeholder="Enter name" className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white placeholder-gray-500" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Birth Date
                      </label>
                      <input type="date" value={newPerson.birthDate} onChange={e => setNewPerson({
                    ...newPerson,
                    birthDate: e.target.value
                  })} className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Relationship
                      </label>
                      <select value={newPerson.relationship} onChange={e => setNewPerson({
                    ...newPerson,
                    relationship: e.target.value as any
                  })} className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-300 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white">
                        <option value="family">Family</option>
                        <option value="friend">Friend</option>
                        <option value="partner">Partner</option>
                        <option value="colleague">Colleague</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <GlassButton variant="ghost" size="md" onClick={() => setShowAddModal(false)} className="flex-1">
                        Cancel
                      </GlassButton>
                      <GlassButton variant="liquid" size="md" onClick={handleAddPerson} className="flex-1 glass-glow" disabled={!newPerson.name || !newPerson.birthDate}>
                        Add Person
                      </GlassButton>
                    </div>
                  </div>
                </div>
              </MagneticCard>
            </motion.div>
          </motion.div>}
      </AnimatePresence>
    </div>;
}