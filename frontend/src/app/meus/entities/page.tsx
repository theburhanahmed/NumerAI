'use client';

import React, { useState, useEffect } from 'react';
import { meusAPI } from '@/lib/numerology-api';
import { FeatureGate } from '@/components/FeatureGate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

interface Entity {
  id: string;
  entity_type: 'person' | 'asset' | 'event';
  name: string;
  date_of_birth?: string;
  relationship_type?: string;
  compatibility_with_user?: any;
  influence_on_user?: any;
}

export default function EntitiesPage() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    entity_type: 'person' as 'person' | 'asset' | 'event',
    name: '',
    date_of_birth: '',
    relationship_type: '',
  });

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    try {
      setIsLoading(true);
      const data = await meusAPI.getEntities();
      setEntities(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Failed to load entities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      await meusAPI.createEntity({
        ...formData,
        date_of_birth: formData.date_of_birth || undefined,
        relationship_type: formData.relationship_type || undefined,
      });
      setShowForm(false);
      setFormData({
        entity_type: 'person',
        name: '',
        date_of_birth: '',
        relationship_type: '',
      });
      loadEntities();
    } catch (err) {
      console.error('Failed to create entity:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entity?')) return;
    try {
      await meusAPI.deleteEntity(id);
      loadEntities();
    } catch (err) {
      console.error('Failed to delete entity:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <FeatureGate featureName="meus_entities">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Entities</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entity
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Entity</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label>Entity Type</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.entity_type}
                    onChange={(e) => setFormData({ ...formData, entity_type: e.target.value as any })}
                  >
                    <option value="person">Person</option>
                    <option value="asset">Asset</option>
                    <option value="event">Event</option>
                  </select>
                </div>

                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                {formData.entity_type === 'person' && (
                  <>
                    <div>
                      <Label>Date of Birth</Label>
                      <Input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label>Relationship Type</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.relationship_type}
                        onChange={(e) => setFormData({ ...formData, relationship_type: e.target.value })}
                      >
                        <option value="">Select relationship</option>
                        <option value="family">Family</option>
                        <option value="friend">Friend</option>
                        <option value="partner">Romantic Partner</option>
                        <option value="colleague">Colleague</option>
                        <option value="business_partner">Business Partner</option>
                        <option value="child">Child</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entities.map((entity) => (
            <Card key={entity.id}>
              <CardHeader>
                <CardTitle>{entity.name}</CardTitle>
                <CardDescription>
                  {entity.entity_type.charAt(0).toUpperCase() + entity.entity_type.slice(1)}
                  {entity.relationship_type && ` • ${entity.relationship_type}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {entity.compatibility_with_user && (
                  <div className="mb-2">
                    <div className="text-sm text-muted-foreground">Compatibility</div>
                    <div className="text-lg font-semibold">
                      {entity.compatibility_with_user.overall_score || 0}%
                    </div>
                  </div>
                )}
                {entity.influence_on_user && (
                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground">Influence</div>
                    <div className="text-lg font-semibold">
                      {entity.influence_on_user.influence_strength || 0}%
                      <span className={`ml-2 text-sm ${
                        entity.influence_on_user.impact_type === 'positive' ? 'text-green-600' :
                        entity.influence_on_user.impact_type === 'negative' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        ({entity.influence_on_user.impact_type})
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Link href={`/meus/entities/${entity.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(entity.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {entities.length === 0 && !isLoading && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No entities yet. Add your first entity to get started!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </FeatureGate>
  );
}

