'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Users, 
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  UserCircle
} from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { GlassButton } from '@/components/glassmorphism/glass-button';
import { useAuth } from '@/contexts/auth-context';
import { peopleAPI } from '@/lib/numerology-api';
import { Person } from '@/types';

export default function PeoplePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPeople();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = people.filter(person => 
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.relationship.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPeople(filtered);
    } else {
      setFilteredPeople(people);
    }
  }, [searchTerm, people]);

  const fetchPeople = async () => {
    try {
      setLoading(true);
      const data = await peopleAPI.getPeople();
      setPeople(data);
      setFilteredPeople(data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch people:', err);
      setError('Failed to load people');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePerson = async (personId: string) => {
    if (!confirm('Are you sure you want to delete this person?')) {
      return;
    }

    try {
      await peopleAPI.deletePerson(personId);
      fetchPeople(); // Refresh the list
    } catch (err) {
      console.error('Failed to delete person:', err);
      setError('Failed to delete person');
    }
  };

  const handleAddPerson = () => {
    router.push('/people/add');
  };

  const handleEditPerson = (personId: string) => {
    router.push(`/people/${personId}/edit`);
  };

  const handleViewPerson = (personId: string) => {
    router.push(`/people/${personId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-white/50 dark:bg-gray-800/50 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-white/50 dark:bg-gray-800/50 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                People
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage people for numerology reports
              </p>
            </div>
            
            <GlassButton 
              variant="primary" 
              onClick={handleAddPerson}
              icon={<Plus className="w-5 h-5" />}
            >
              Add Person
            </GlassButton>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Search */}
          <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* People Grid */}
          {filteredPeople.length === 0 ? (
            <GlassCard variant="default" className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No People Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm ? 'No people match your search.' : 'Add people to generate numerology reports for them.'}
              </p>
              <GlassButton 
                variant="primary" 
                onClick={handleAddPerson}
                icon={<Plus className="w-5 h-5" />}
              >
                Add Person
              </GlassButton>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPeople.map((person) => (
                <motion.div
                  key={person.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <GlassCard 
                    variant="default" 
                    className="p-6 hover:ring-2 hover:ring-purple-500 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <UserCircle className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {person.name}
                        </h3>
                        
                        <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {new Date(person.birth_date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="mt-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            {person.relationship}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-6">
                      <GlassButton 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleViewPerson(person.id)}
                        className="flex-1"
                      >
                        View
                      </GlassButton>
                      <GlassButton 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditPerson(person.id)}
                        icon={<Edit className="w-4 h-4" />}
                      >
                        Edit
                      </GlassButton>
                      <GlassButton 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeletePerson(person.id)}
                        icon={<Trash2 className="w-4 h-4" />}
                      >
                        Delete
                      </GlassButton>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}