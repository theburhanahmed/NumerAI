"""
Graph generator service for MEUS network visualization.
"""
from typing import Dict, List, Optional, Any, Set
from collections import defaultdict
from meus.models import EntityProfile, EntityRelationship
from accounts.models import User
from .compatibility_engine import CompatibilityEngine


class GraphGeneratorService:
    """Service for generating relationship graphs."""
    
    def __init__(self):
        self.compatibility_engine = CompatibilityEngine()
    
    def generate_network_graph(
        self,
        user: User,
        include_user_node: bool = True
    ) -> Dict[str, Any]:
        """
        Generate network graph data for visualization.
        
        Args:
            user: User instance
            include_user_node: Whether to include user as a node
            
        Returns:
            Graph data with nodes and edges
        """
        entities = EntityProfile.objects.filter(user=user, is_active=True).select_related('numerology_profile')
        
        # Build nodes
        nodes = []
        if include_user_node:
            user_profile = getattr(user, 'numerology_profile', None)
            nodes.append({
                'id': str(user.id),
                'type': 'user',
                'label': user.full_name or 'You',
                'life_path': getattr(user_profile, 'life_path_number', None) if user_profile else None,
                'destiny': getattr(user_profile, 'destiny_number', None) if user_profile else None,
            })
        
        for entity in entities:
            profile = entity.numerology_profile
            nodes.append({
                'id': str(entity.id),
                'type': entity.entity_type,
                'label': entity.name,
                'life_path': profile.life_path_number if profile else None,
                'destiny': profile.destiny_number if profile else None,
                'relationship': entity.relationship_type,
                'entity_type': entity.entity_type,
            })
        
        # Build edges
        edges = []
        relationships = EntityRelationship.objects.filter(
            entity_1__user=user,
            entity_1__is_active=True,
            entity_2__is_active=True
        ).select_related('entity_1', 'entity_2')
        
        for rel in relationships:
            # Edge from user to entity_1
            if include_user_node:
                edges.append({
                    'source': str(user.id),
                    'target': str(rel.entity_1.id),
                    'compatibility': rel.compatibility_score or 0,
                    'influence': rel.influence_score or 0,
                    'type': rel.relationship_type or 'neutral',
                    'weight': abs(rel.influence_score or 0) / 100 if rel.influence_score else 0.5
                })
            
            # Edge from entity_1 to entity_2
            edges.append({
                'source': str(rel.entity_1.id),
                'target': str(rel.entity_2.id),
                'compatibility': rel.compatibility_score or 0,
                'influence': rel.influence_score or 0,
                'type': rel.relationship_type or 'neutral',
                'weight': abs(rel.influence_score or 0) / 100 if rel.influence_score else 0.5
            })
        
        # Calculate clusters
        clusters = self._identify_clusters(nodes, edges)
        
        # Calculate graph metrics
        metrics = self._calculate_graph_metrics(nodes, edges)
        
        return {
            'nodes': nodes,
            'edges': edges,
            'clusters': clusters,
            'metrics': metrics
        }
    
    def generate_influence_graph(
        self,
        user: User,
        period: str = None
    ) -> Dict[str, Any]:
        """
        Generate influence-focused graph.
        
        Args:
            user: User instance
            period: Period string ('2026' or '2026-04')
            
        Returns:
            Influence graph data
        """
        from .influence_scoring import InfluenceScoringService
        influence_service = InfluenceScoringService()
        
        entities = EntityProfile.objects.filter(user=user, is_active=True)
        
        nodes = [{
            'id': str(user.id),
            'type': 'user',
            'label': user.full_name or 'You',
            'influence': 100,  # User is center
            'impact_type': 'neutral'
        }]
        
        edges = []
        
        for entity in entities:
            influence = influence_service.calculate_influence(entity, user, period)
            
            nodes.append({
                'id': str(entity.id),
                'type': entity.entity_type,
                'label': entity.name,
                'influence': influence['influence_strength'],
                'impact_type': influence['impact_type'],
                'impact_areas': influence['impact_areas']
            })
            
            edges.append({
                'source': str(user.id),
                'target': str(entity.id),
                'influence': influence['influence_strength'],
                'impact_type': influence['impact_type'],
                'weight': influence['influence_strength'] / 100
            })
        
        return {
            'nodes': nodes,
            'edges': edges,
            'period': period
        }
    
    def _identify_clusters(
        self,
        nodes: List[Dict],
        edges: List[Dict]
    ) -> List[Dict[str, Any]]:
        """Identify clusters in the graph."""
        # Simple clustering based on relationship types
        clusters = defaultdict(list)
        
        for node in nodes:
            if node['type'] == 'user':
                continue
            
            relationship = node.get('relationship', 'other')
            clusters[relationship].append(node['id'])
        
        return [
            {
                'name': cluster_name,
                'nodes': node_ids,
                'size': len(node_ids)
            }
            for cluster_name, node_ids in clusters.items()
        ]
    
    def _calculate_graph_metrics(
        self,
        nodes: List[Dict],
        edges: List[Dict]
    ) -> Dict[str, Any]:
        """Calculate graph metrics."""
        total_nodes = len(nodes)
        total_edges = len(edges)
        
        # Calculate average compatibility
        compatibilities = [e.get('compatibility', 0) for e in edges if e.get('compatibility')]
        avg_compatibility = sum(compatibilities) / len(compatibilities) if compatibilities else 0
        
        # Count by relationship type
        relationship_counts = defaultdict(int)
        for edge in edges:
            rel_type = edge.get('type', 'neutral')
            relationship_counts[rel_type] += 1
        
        # Count positive vs negative influences
        positive_edges = sum(1 for e in edges if e.get('influence', 0) > 0)
        negative_edges = sum(1 for e in edges if e.get('influence', 0) < 0)
        neutral_edges = sum(1 for e in edges if e.get('influence', 0) == 0)
        
        return {
            'total_nodes': total_nodes,
            'total_edges': total_edges,
            'average_compatibility': round(avg_compatibility, 2),
            'relationship_distribution': dict(relationship_counts),
            'influence_distribution': {
                'positive': positive_edges,
                'negative': negative_edges,
                'neutral': neutral_edges
            },
            'density': total_edges / (total_nodes * (total_nodes - 1) / 2) if total_nodes > 1 else 0
        }
    
    def find_conflicts(
        self,
        user: User
    ) -> List[Dict[str, Any]]:
        """
        Find conflicting relationships in the graph.
        
        Args:
            user: User instance
            
        Returns:
            List of conflict relationships
        """
        conflicts = []
        
        relationships = EntityRelationship.objects.filter(
            entity_1__user=user,
            compatibility_score__lt=40
        ).select_related('entity_1', 'entity_2')
        
        for rel in relationships:
            conflicts.append({
                'entity_1_id': str(rel.entity_1.id),
                'entity_1_name': rel.entity_1.name,
                'entity_2_id': str(rel.entity_2.id),
                'entity_2_name': rel.entity_2.name,
                'compatibility_score': rel.compatibility_score,
                'relationship_type': rel.relationship_type,
                'severity': 'high' if rel.compatibility_score < 25 else 'medium'
            })
        
        return conflicts
    
    def find_harmonious_connections(
        self,
        user: User
    ) -> List[Dict[str, Any]]:
        """
        Find harmonious relationships in the graph.
        
        Args:
            user: User instance
            
        Returns:
            List of harmonious relationships
        """
        harmonious = []
        
        relationships = EntityRelationship.objects.filter(
            entity_1__user=user,
            compatibility_score__gte=75
        ).select_related('entity_1', 'entity_2')
        
        for rel in relationships:
            harmonious.append({
                'entity_1_id': str(rel.entity_1.id),
                'entity_1_name': rel.entity_1.name,
                'entity_2_id': str(rel.entity_2.id),
                'entity_2_name': rel.entity_2.name,
                'compatibility_score': rel.compatibility_score,
                'relationship_type': rel.relationship_type,
                'strength': 'very_strong' if rel.compatibility_score >= 90 else 'strong'
            })
        
        return harmonious

