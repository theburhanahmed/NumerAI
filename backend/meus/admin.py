"""
Django admin configuration for MEUS models.
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import (
    EntityProfile,
    EntityRelationship,
    EntityInfluence,
    UniverseEvent,
    AssetProfile,
    CrossProfileAnalysisCache
)


@admin.register(EntityProfile)
class EntityProfileAdmin(admin.ModelAdmin):
    """Admin interface for EntityProfile."""
    
    list_display = ['name', 'user', 'entity_type', 'relationship_type', 'is_active', 'created_at']
    list_filter = ['entity_type', 'relationship_type', 'is_active', 'created_at']
    search_fields = ['name', 'user__email', 'user__full_name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    raw_id_fields = ['user', 'numerology_profile']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'user', 'entity_type', 'name', 'date_of_birth', 'relationship_type')
        }),
        ('Numerology', {
            'fields': ('numerology_profile',)
        }),
        ('Metadata', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(EntityRelationship)
class EntityRelationshipAdmin(admin.ModelAdmin):
    """Admin interface for EntityRelationship."""
    
    list_display = ['entity_1', 'entity_2', 'relationship_type', 'compatibility_score', 'influence_score', 'calculated_at']
    list_filter = ['relationship_type', 'calculated_at']
    search_fields = ['entity_1__name', 'entity_2__name']
    readonly_fields = ['id', 'calculated_at', 'created_at', 'updated_at']
    raw_id_fields = ['entity_1', 'entity_2']
    
    fieldsets = (
        ('Entities', {
            'fields': ('entity_1', 'entity_2')
        }),
        ('Analysis', {
            'fields': ('relationship_type', 'compatibility_score', 'influence_score', 'analysis_data')
        }),
        ('Cache', {
            'fields': ('expires_at',)
        }),
        ('Timestamps', {
            'fields': ('calculated_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(EntityInfluence)
class EntityInfluenceAdmin(admin.ModelAdmin):
    """Admin interface for EntityInfluence."""
    
    list_display = ['entity', 'user', 'influence_strength', 'impact_type', 'cycle_period', 'cycle_value', 'calculated_at']
    list_filter = ['impact_type', 'cycle_period', 'calculated_at']
    search_fields = ['entity__name', 'user__email', 'user__full_name']
    readonly_fields = ['id', 'calculated_at', 'created_at', 'updated_at']
    raw_id_fields = ['user', 'entity']
    
    fieldsets = (
        ('Entities', {
            'fields': ('user', 'entity')
        }),
        ('Influence', {
            'fields': ('influence_strength', 'impact_type', 'impact_areas')
        }),
        ('Cycle', {
            'fields': ('cycle_period', 'cycle_value')
        }),
        ('Timestamps', {
            'fields': ('calculated_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(UniverseEvent)
class UniverseEventAdmin(admin.ModelAdmin):
    """Admin interface for UniverseEvent."""
    
    list_display = ['title', 'user', 'event_type', 'event_date', 'is_completed', 'created_at']
    list_filter = ['event_type', 'is_completed', 'event_date', 'created_at']
    search_fields = ['title', 'description', 'user__email', 'user__full_name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    raw_id_fields = ['user']
    filter_horizontal = ['related_entities']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'user', 'event_type', 'title', 'description', 'event_date')
        }),
        ('Related Entities', {
            'fields': ('related_entities',)
        }),
        ('Numerology', {
            'fields': ('numerology_insight',),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_completed',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(AssetProfile)
class AssetProfileAdmin(admin.ModelAdmin):
    """Admin interface for AssetProfile."""
    
    list_display = ['entity', 'asset_type', 'asset_number', 'numerology_vibration', 'safety_score', 'compatibility_with_owner']
    list_filter = ['asset_type', 'created_at']
    search_fields = ['asset_number', 'entity__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    raw_id_fields = ['entity']
    
    fieldsets = (
        ('Asset Information', {
            'fields': ('id', 'entity', 'asset_type', 'asset_number')
        }),
        ('Numerology Analysis', {
            'fields': ('numerology_vibration', 'safety_score', 'compatibility_with_owner')
        }),
        ('Additional Data', {
            'fields': ('additional_data',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CrossProfileAnalysisCache)
class CrossProfileAnalysisCacheAdmin(admin.ModelAdmin):
    """Admin interface for CrossProfileAnalysisCache."""
    
    list_display = ['user', 'entity_combination_hash_short', 'expires_at', 'calculated_at']
    list_filter = ['expires_at', 'calculated_at']
    search_fields = ['user__email', 'user__full_name', 'entity_combination_hash']
    readonly_fields = ['id', 'calculated_at', 'created_at']
    raw_id_fields = ['user']
    
    def entity_combination_hash_short(self, obj):
        return f"{obj.entity_combination_hash[:16]}..." if obj.entity_combination_hash else "-"
    entity_combination_hash_short.short_description = 'Hash'
    
    fieldsets = (
        ('Cache Information', {
            'fields': ('id', 'user', 'entity_combination_hash')
        }),
        ('Analysis Result', {
            'fields': ('analysis_result',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('calculated_at', 'expires_at', 'created_at')
        }),
    )
