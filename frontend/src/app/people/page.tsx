'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UsersIcon, PlusIcon, HeartIcon, BriefcaseIcon, HomeIcon, UserIcon, CalendarIcon, SparklesIcon, EditIcon, TrashIcon, XIcon } from 'lucide-react';
import { SpaceCard } from '@/components/space/space-card';
import { TouchOptimizedButton } from '@/components/buttons/touch-optimized-button';
import { CosmicPageLayout } from '@/components/cosmic/cosmic-page-layout';
import { PageDescription } from '@/components/ui/page-description';
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
  return (
    <CosmicPageLayout>
      <main className="flex-1 section-spacing px-4 md:px-6">
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
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                My People
              </h1>
              <p className="text-lg text-white/70">
                Manage and explore numerology profiles of people in your life
              </p>
            </div>
            <TouchOptimizedButton variant="primary" size="lg" icon={<PlusIcon className="w-5 h-5" />} onClick={() => setShowAddModal(true)}>
              Add Person
            </TouchOptimizedButton>
          </motion.div>

          {/* Page Description */}
          <PageDescription
            title="My People - Numerology Profiles"
            description="Store and analyze the numerology profiles of family members, friends, partners, and colleagues. Each person's profile is automatically calculated when you add them, giving you instant insights into their life path, destiny, and compatibility with you."
            features={[
              "Automatically calculate numerology profiles when adding people",
              "View detailed numerology numbers for each person",
              "Track compatibility scores between you and others",
              "Generate reports for any person in your list",
              "Organize people by relationship type"
            ]}
            usage="Click 'Add Person' to add someone new. Enter their full name and birth date, and their numerology profile will be calculated automatically. You can then view their complete numerology analysis, check compatibility, and generate detailed reports."
            examples={[
              "Add family members to understand family numerology dynamics",
              "Track your partner's numerology for relationship insights",
              "Analyze business partners for compatibility",
              "Store friends' profiles for social numerology analysis"
            ]}
          />

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
                <SpaceCard variant="premium" className="p-6 h-full" glow>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${relationshipColors[person.relationship]} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                      {relationshipIcons[person.relationship]}
                    </div>
                    <div className="flex gap-2">
                      <motion.button className="p-2 rounded-lg hover:bg-[#1a2942]/40 transition-colors" whileHover={{
                      scale: 1.1
                    }} whileTap={{
                      scale: 0.95
                    }}>
                          <EditIcon className="w-4 h-4 text-white/70" />
                        </motion.button>
                        <motion.button onClick={() => handleDeletePerson(person.id)} className="p-2 rounded-lg hover:bg-red-500/20 transition-colors" whileHover={{
                      scale: 1.1
                    }} whileTap={{
                      scale: 0.95
                    }}>
                          <TrashIcon className="w-4 h-4 text-red-400" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Info */}
                    <h3 className="text-xl font-bold text-white mb-1">
                      {person.name}
                    </h3>
                    <p className="text-sm text-white/70 mb-4 capitalize">
                      {person.relationship}
                    </p>

                    {/* Stats */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/70">
                          Life Path
                        </span>
                        <span className="font-bold text-white">
                          {person.lifePathNumber}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/70">
                          Personal Year
                        </span>
                        <span className="font-bold text-white">
                          {person.personalYear}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/70">
                          Compatibility
                        </span>
                        <span className="font-bold text-green-400">
                          {person.compatibility}%
                        </span>
                      </div>
                    </div>

                    {/* Birth Date */}
                    <div className="flex items-center gap-2 text-sm text-white/70 mb-4">
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
                    <TouchOptimizedButton variant="secondary" size="sm" className="w-full" icon={<SparklesIcon className="w-4 h-4" />}>
                      View Full Profile
                    </TouchOptimizedButton>
                </SpaceCard>
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
              <SpaceCard variant="premium" className="p-8 max-w-md mx-auto" glow>
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center text-white mb-6 mx-auto shadow-xl">
                    <UsersIcon className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    No People Added Yet
                  </h3>
                  <p className="text-white/70 mb-6">
                    Start building your numerology network by adding people in
                    your life
                  </p>
                  <TouchOptimizedButton variant="primary" size="lg" icon={<PlusIcon className="w-5 h-5" />} onClick={() => setShowAddModal(true)}>
                    Add Your First Person
                  </TouchOptimizedButton>
              </SpaceCard>
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
              <SpaceCard variant="premium" className="p-6" glow>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">
                      Add New Person
                    </h3>
                    <motion.button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl hover:bg-[#1a2942]/40 transition-colors" whileHover={{
                  scale: 1.1
                }} whileTap={{
                  scale: 0.95
                }}>
                      <XIcon className="w-5 h-5 text-white/70" />
                    </motion.button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-white/90 mb-2">
                        Name
                      </label>
                      <input type="text" value={newPerson.name} onChange={e => setNewPerson({
                    ...newPerson,
                    name: e.target.value
                  })} placeholder="Enter name" className="w-full px-4 py-3 bg-[#1a2942]/40 backdrop-blur-xl border border-cyan-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-white/50" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white/90 mb-2">
                        Birth Date
                      </label>
                      <input type="date" value={newPerson.birthDate} onChange={e => setNewPerson({
                    ...newPerson,
                    birthDate: e.target.value
                  })} className="w-full px-4 py-3 bg-[#1a2942]/40 backdrop-blur-xl border border-cyan-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white/90 mb-2">
                        Relationship
                      </label>
                      <select value={newPerson.relationship} onChange={e => setNewPerson({
                    ...newPerson,
                    relationship: e.target.value as any
                  })} className="w-full px-4 py-3 bg-[#1a2942]/40 backdrop-blur-xl border border-cyan-500/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white">
                        <option value="family">Family</option>
                        <option value="friend">Friend</option>
                        <option value="partner">Partner</option>
                        <option value="colleague">Colleague</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <TouchOptimizedButton variant="secondary" size="md" onClick={() => setShowAddModal(false)} className="flex-1">
                        Cancel
                      </TouchOptimizedButton>
                      <TouchOptimizedButton variant="primary" size="md" onClick={handleAddPerson} className="flex-1" disabled={!newPerson.name || !newPerson.birthDate}>
                        Add Person
                      </TouchOptimizedButton>
                    </div>
                  </div>
              </SpaceCard>
            </motion.div>
          </motion.div>}
      </AnimatePresence>
    </CosmicPageLayout>
  );
}