"""
Management command to initialize feature flags from PRD.
Migrates existing SUBSCRIPTION_FEATURES and creates all PRD feature flags.
"""
from django.core.management.base import BaseCommand
from feature_flags.models import FeatureFlag, SubscriptionFeatureAccess
from feature_flags.services import FeatureFlagManager
from numerology.constants import SUBSCRIPTION_FEATURES


class Command(BaseCommand):
    help = 'Initialize feature flags from PRD and migrate existing SUBSCRIPTION_FEATURES'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be created without actually creating',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made'))
        
        # Define all PRD features with their default tiers
        prd_features = [
            # Core Features
            {'name': 'birth_date_numerology', 'display_name': 'Birth Date Numerology', 'category': 'core', 'default_tier': 'free'},
            {'name': 'basic_interpretations', 'display_name': 'Basic Interpretations', 'category': 'core', 'default_tier': 'free'},
            {'name': 'name_numerology', 'display_name': 'Name Numerology', 'category': 'core', 'default_tier': 'basic'},
            {'name': 'phone_numerology', 'display_name': 'Phone Number Numerology', 'category': 'core', 'default_tier': 'premium'},
            {'name': 'lo_shu_grid', 'display_name': 'Lo Shu Grid', 'category': 'core', 'default_tier': 'basic'},
            {'name': 'rectification_suggestions', 'display_name': 'Rectification Suggestions', 'category': 'core', 'default_tier': 'basic'},
            {'name': 'detailed_analysis', 'display_name': 'Detailed Analysis', 'category': 'core', 'default_tier': 'premium'},
            {'name': 'compatibility_insights', 'display_name': 'Compatibility Insights', 'category': 'core', 'default_tier': 'premium'},
            {'name': 'raj_yog_analysis', 'display_name': 'Raj Yog Analysis', 'category': 'core', 'default_tier': 'elite'},
            {'name': 'yearly_forecast', 'display_name': 'Yearly Forecast', 'category': 'core', 'default_tier': 'elite'},
            {'name': 'expert_recommendations', 'display_name': 'Expert Recommendations', 'category': 'core', 'default_tier': 'elite'},
            
            # MEUS Features
            {'name': 'meus_entities', 'display_name': 'MEUS: Entity Management', 'category': 'meus', 'default_tier': 'premium', 'description': 'Store and manage people, assets, and events'},
            {'name': 'meus_assets', 'display_name': 'MEUS: Asset Numerology', 'category': 'meus', 'default_tier': 'premium', 'description': 'Analyze vehicles, properties, and businesses'},
            {'name': 'meus_events', 'display_name': 'MEUS: Event Tracking', 'category': 'meus', 'default_tier': 'premium', 'description': 'Track and analyze major life events'},
            {'name': 'meus_analysis', 'display_name': 'MEUS: Cross-Entity Analysis', 'category': 'meus', 'default_tier': 'premium', 'description': 'Analyze relationships between all entities'},
            {'name': 'meus_dashboard', 'display_name': 'MEUS: Universe Dashboard', 'category': 'meus', 'default_tier': 'premium', 'description': 'Visual dashboard of your universe'},
            {'name': 'meus_recommendations', 'display_name': 'MEUS: Action Recommendations', 'category': 'meus', 'default_tier': 'elite', 'description': 'AI-powered action recommendations'},
            {'name': 'meus_reports', 'display_name': 'MEUS: Multi-Profile Reports', 'category': 'meus', 'default_tier': 'elite', 'description': 'Generate comprehensive universe reports'},
            
            # Numerology Features
            {'name': 'numerology_essence_cycles', 'display_name': 'Essence Cycles', 'category': 'numerology', 'default_tier': 'premium'},
            {'name': 'numerology_cycle_visualization', 'display_name': 'Cycle Visualization', 'category': 'numerology', 'default_tier': 'premium'},
            {'name': 'numerology_universal_cycles', 'display_name': 'Universal Cycles', 'category': 'numerology', 'default_tier': 'premium'},
            {'name': 'numerology_cycle_alerts', 'display_name': 'Cycle Alerts', 'category': 'numerology', 'default_tier': 'premium'},
            {'name': 'numerology_vehicle', 'display_name': 'Vehicle Numerology', 'category': 'numerology', 'default_tier': 'premium'},
            {'name': 'numerology_property', 'display_name': 'Property Numerology', 'category': 'numerology', 'default_tier': 'premium'},
            {'name': 'numerology_business', 'display_name': 'Business Numerology', 'category': 'numerology', 'default_tier': 'premium'},
            {'name': 'numerology_sexual_energy', 'display_name': 'Sexual Energy Numerology', 'category': 'numerology', 'default_tier': 'premium'},
            {'name': 'numerology_marriage_harmony', 'display_name': 'Marriage Harmony Cycles', 'category': 'numerology', 'default_tier': 'premium'},
            {'name': 'numerology_multi_partner', 'display_name': 'Multi-Partner Comparison', 'category': 'numerology', 'default_tier': 'premium'},
            {'name': 'numerology_timing_optimization', 'display_name': 'Timing Optimization', 'category': 'numerology', 'default_tier': 'premium'},
            {'name': 'numerology_danger_dates', 'display_name': 'Danger Dates Identification', 'category': 'numerology', 'default_tier': 'premium'},
            {'name': 'numerology_lo_shu_visualization', 'display_name': 'Lo Shu Grid Visualization', 'category': 'numerology', 'default_tier': 'premium'},
            {'name': 'numerology_grid_comparison', 'display_name': 'Grid Comparison', 'category': 'numerology', 'default_tier': 'premium'},
            {'name': 'numerology_health', 'display_name': 'Health Numerology', 'category': 'numerology', 'default_tier': 'elite'},
            {'name': 'numerology_medical_timing', 'display_name': 'Medical Procedure Timing', 'category': 'numerology', 'default_tier': 'elite'},
            {'name': 'numerology_name_correction', 'display_name': 'Name Correction', 'category': 'numerology', 'default_tier': 'elite'},
            {'name': 'numerology_phonetic_optimization', 'display_name': 'Phonetic Optimization', 'category': 'numerology', 'default_tier': 'elite'},
            {'name': 'numerology_spiritual', 'display_name': 'Spiritual Numerology', 'category': 'numerology', 'default_tier': 'elite'},
            {'name': 'numerology_soul_contracts', 'display_name': 'Soul Contracts', 'category': 'numerology', 'default_tier': 'elite'},
            {'name': 'numerology_predictive', 'display_name': 'Predictive Numerology', 'category': 'numerology', 'default_tier': 'elite'},
            {'name': 'numerology_forecasting', 'display_name': 'Life Forecasting', 'category': 'numerology', 'default_tier': 'elite'},
            {'name': 'numerology_generational', 'display_name': 'Generational Numerology', 'category': 'numerology', 'default_tier': 'elite'},
            {'name': 'numerology_family_analysis', 'display_name': 'Family Analysis', 'category': 'numerology', 'default_tier': 'elite'},
            {'name': 'numerology_feng_shui', 'display_name': 'Feng Shui Hybrid', 'category': 'numerology', 'default_tier': 'elite'},
            {'name': 'numerology_space_optimization', 'display_name': 'Space Optimization', 'category': 'numerology', 'default_tier': 'elite'},
            {'name': 'numerology_mental_state', 'display_name': 'Mental State AI', 'category': 'numerology', 'default_tier': 'elite'},
            {'name': 'numerology_emotional_tracking', 'display_name': 'Emotional Tracking', 'category': 'numerology', 'default_tier': 'elite'},
            
            # AI Features
            {'name': 'ai_chat', 'display_name': 'AI Numerology Chat', 'category': 'ai', 'default_tier': 'free'},
            {'name': 'ai_co_pilot', 'display_name': 'AI Co-Pilot', 'category': 'ai', 'default_tier': 'premium'},
            {'name': 'ai_decision_engine', 'display_name': 'Decision Engine', 'category': 'ai', 'default_tier': 'premium'},
            {'name': 'ai_life_coach', 'display_name': 'Numerology Life Coach', 'category': 'ai', 'default_tier': 'elite'},
            
            # Reports
            {'name': 'reports_basic', 'display_name': 'Basic Reports', 'category': 'reports', 'default_tier': 'free'},
            {'name': 'reports_detailed', 'display_name': 'Detailed Reports', 'category': 'reports', 'default_tier': 'premium'},
            {'name': 'reports_pdf_export', 'display_name': 'PDF Export', 'category': 'reports', 'default_tier': 'premium'},
            {'name': 'reports_bulk', 'display_name': 'Bulk Report Generation', 'category': 'reports', 'default_tier': 'elite'},
            
            # Social Features
            {'name': 'social_connections', 'display_name': 'Social Connections', 'category': 'social', 'default_tier': 'free'},
            {'name': 'social_matchmaking', 'display_name': 'Matchmaking', 'category': 'social', 'default_tier': 'premium'},
        ]
        
        created_count = 0
        updated_count = 0
        
        # Migrate existing SUBSCRIPTION_FEATURES
        self.stdout.write(self.style.SUCCESS('Migrating existing SUBSCRIPTION_FEATURES...'))
        
        for tier, features in SUBSCRIPTION_FEATURES.items():
            for feature_name, is_enabled in features.items():
                # Find or create feature flag
                feature_flag, created = FeatureFlag.objects.get_or_create(
                    name=feature_name,
                    defaults={
                        'display_name': feature_name.replace('_', ' ').title(),
                        'category': 'core',
                        'default_tier': tier if is_enabled else 'elite',
                        'is_active': True,
                    }
                )
                
                if created:
                    created_count += 1
                    self.stdout.write(f'  Created: {feature_flag.name}')
                else:
                    updated_count += 1
                
                # Set tier access
                if not dry_run:
                    SubscriptionFeatureAccess.objects.update_or_create(
                        feature_flag=feature_flag,
                        subscription_tier=tier,
                        defaults={'is_enabled': is_enabled}
                    )
        
        # Create all PRD features
        self.stdout.write(self.style.SUCCESS('\nCreating PRD features...'))
        
        for feature_data in prd_features:
            feature_flag, created = FeatureFlag.objects.get_or_create(
                name=feature_data['name'],
                defaults={
                    'display_name': feature_data['display_name'],
                    'description': feature_data.get('description', ''),
                    'category': feature_data['category'],
                    'default_tier': feature_data['default_tier'],
                    'is_active': True,
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(f'  Created: {feature_flag.name} ({feature_flag.category})')
                
                if not dry_run:
                    # Create tier access based on default_tier
                    tiers = ['free', 'basic', 'premium', 'elite']
                    default_tier_index = tiers.index(feature_data['default_tier'])
                    
                    for i, tier in enumerate(tiers):
                        is_enabled = i >= default_tier_index
                        SubscriptionFeatureAccess.objects.create(
                            subscription_tier=tier,
                            feature_flag=feature_flag,
                            is_enabled=is_enabled
                        )
            else:
                # Update existing feature if needed
                updated = False
                for field, value in feature_data.items():
                    if field != 'name' and hasattr(feature_flag, field):
                        if getattr(feature_flag, field) != value:
                            setattr(feature_flag, field, value)
                            updated = True
                
                if updated and not dry_run:
                    feature_flag.save()
                    updated_count += 1
                    self.stdout.write(f'  Updated: {feature_flag.name}')
        
        self.stdout.write(self.style.SUCCESS(f'\nSummary:'))
        self.stdout.write(f'  Created: {created_count} feature flags')
        self.stdout.write(f'  Updated: {updated_count} feature flags')
        
        if dry_run:
            self.stdout.write(self.style.WARNING('\nThis was a dry run. Run without --dry-run to apply changes.'))
        else:
            self.stdout.write(self.style.SUCCESS('\nFeature flags initialized successfully!'))

