"""
URL routing for numerology application.
"""
from django.urls import path
from . import views

app_name = 'numerology'

urlpatterns = [
    # Health check
    path('health/', views.health_check, name='health-check'),
    
    # Numerology endpoints
    path('numerology/calculate/', views.calculate_numerology_profile, name='calculate-numerology'),
    path('numerology/profile/', views.get_numerology_profile, name='numerology-profile'),
    path('numerology/birth-chart/', views.get_birth_chart, name='birth-chart'),
    path('numerology/birth-chart/pdf/', views.export_birth_chart_pdf, name='birth-chart-pdf'),
    path('numerology/daily-reading/', views.get_daily_reading, name='daily-reading'),
    path('numerology/reading-history/', views.get_reading_history, name='reading-history'),
    
    # New numerology endpoints
    path('numerology/life-path-analysis/', views.get_life_path_analysis, name='life-path-analysis'),
    path('numerology/compatibility-check/', views.check_compatibility, name='compatibility-check'),
    path('numerology/compatibility-history/', views.get_compatibility_history, name='compatibility-history'),
    path('numerology/remedies/', views.get_personalized_remedies, name='personalized-remedies'),
    path('numerology/remedies/<uuid:remedy_id>/track/', views.track_remedy, name='track-remedy'),
    path('numerology/full-report/', views.get_full_numerology_report, name='full-numerology-report'),
    path('numerology/full-report/pdf/', views.export_full_numerology_report_pdf, name='full-numerology-report-pdf'),
    
    # Multi-person numerology endpoints
    path('people/', views.people_list_create, name='people-list-create'),
    path('people/<uuid:person_id>/', views.person_detail, name='person-detail'),
    path('people/<uuid:person_id>/calculate/', views.calculate_person_numerology, name='calculate-person-numerology'),
    path('people/<uuid:person_id>/profile/', views.get_person_numerology_profile, name='person-numerology-profile'),
    
    # Lo Shu Grid
    path('numerology/lo-shu-grid/', views.get_lo_shu_grid, name='lo-shu-grid'),
    path('numerology/lo-shu-grid/compare/', views.compare_lo_shu_grids, name='lo-shu-grid-compare'),
    
    # Raj Yog Detection
    path('numerology/raj-yog/', views.get_raj_yog_detection, name='raj-yog-detection'),
    path('numerology/raj-yog/<uuid:person_id>/', views.get_raj_yog_detection, name='person-raj-yog-detection'),
    path('numerology/raj-yog/explanation/', views.generate_raj_yog_explanation, name='raj-yog-explanation'),
    path('numerology/raj-yog/explanation/<uuid:person_id>/', views.generate_raj_yog_explanation, name='person-raj-yog-explanation'),
    
    # Explanations
    path('numerology/explanations/<uuid:explanation_id>/', views.get_explanation, name='get-explanation'),
    
    # Name Numerology endpoints
    path('name-numerology/generate/', views.generate_name_numerology, name='generate-name-numerology'),
    path('name-numerology/preview/', views.preview_name_numerology, name='preview-name-numerology'),
    path('name-numerology/<uuid:user_id>/<uuid:report_id>/', views.get_name_report, name='get-name-report'),
    path('name-numerology/<uuid:user_id>/latest/', views.get_latest_name_report, name='get-latest-name-report'),
    
    # Weekly Reports
    path('numerology/weekly-report/', views.get_weekly_report, name='weekly-report'),
    path('numerology/weekly-report/<str:week_start_date_str>/', views.get_weekly_report, name='weekly-report-date'),
    path('numerology/weekly-report/<uuid:person_id>/', views.get_weekly_report, name='person-weekly-report'),
    path('numerology/weekly-report/<uuid:person_id>/<str:week_start_date_str>/', views.get_weekly_report, name='person-weekly-report-date'),
    
    # Yearly Reports
    path('numerology/yearly-report/', views.get_yearly_report, name='yearly-report'),
    path('numerology/yearly-report/<int:year>/', views.get_yearly_report, name='yearly-report-year'),
    path('numerology/yearly-report/<uuid:person_id>/', views.get_yearly_report, name='person-yearly-report'),
    path('numerology/yearly-report/<uuid:person_id>/<int:year>/', views.get_yearly_report, name='person-yearly-report-year'),
    
    # Phone Numerology endpoints
    path('phone-numerology/generate/', views.generate_phone_numerology, name='generate-phone-numerology'),
    path('phone-numerology/preview/', views.preview_phone_numerology, name='preview-phone-numerology'),
    path('phone-numerology/<uuid:user_id>/<uuid:report_id>/', views.get_phone_report, name='get-phone-report'),
    path('phone-numerology/<uuid:user_id>/latest/', views.get_latest_phone_report, name='get-latest-phone-report'),
    path('phone-numerology/compatibility/', views.check_phone_compatibility, name='check-phone-compatibility'),
    
    # Enhanced Cycles endpoints
    path('numerology/essence-cycles/', views.get_essence_cycles, name='essence-cycles'),
    path('numerology/cycle-timeline/', views.get_cycle_timeline, name='cycle-timeline'),
    path('numerology/universal-cycles/', views.get_universal_cycles, name='universal-cycles'),
    path('numerology/cycle-compatibility/', views.calculate_cycle_compatibility, name='cycle-compatibility'),
    
    # Asset Numerology endpoints
    path('numerology/vehicle/', views.calculate_vehicle_numerology, name='vehicle-numerology'),
    path('numerology/property/', views.calculate_property_numerology, name='property-numerology'),
    path('numerology/business/', views.calculate_business_numerology, name='business-numerology'),
    path('numerology/phone-asset/', views.calculate_phone_numerology_asset, name='phone-asset-numerology'),
    
    # Relationship Numerology endpoints
    path('numerology/relationship/enhanced-compatibility/', views.calculate_enhanced_compatibility, name='enhanced-compatibility'),
    path('numerology/relationship/compare-partners/', views.compare_multiple_partners, name='compare-partners'),
    path('numerology/relationship/marriage-harmony/', views.calculate_marriage_harmony_cycles, name='marriage-harmony'),
    
    # Timing Numerology endpoints
    path('numerology/timing/best-dates/', views.find_best_dates, name='find-best-dates'),
    path('numerology/timing/danger-dates/', views.find_danger_dates, name='find-danger-dates'),
    path('numerology/timing/optimize/', views.optimize_event_timing, name='optimize-event-timing'),
    
    # Health Numerology endpoints
    path('numerology/health/cycles/', views.calculate_health_cycles, name='health-cycles'),
    path('numerology/health/medical-timing/', views.calculate_medical_timing, name='medical-timing'),
    path('numerology/health/emotional-vulnerabilities/', views.calculate_emotional_vulnerabilities, name='emotional-vulnerabilities'),
    
    # Health Numerology endpoints
    path('numerology/health/', views.get_health_numerology, name='health-numerology'),
    
    # Name Correction endpoints
    path('numerology/name-correction/', views.analyze_name_correction, name='name-correction'),
    
    # Spiritual Numerology endpoints
    path('numerology/spiritual/', views.get_spiritual_numerology, name='spiritual-numerology'),
    
    # Predictive Numerology endpoints
    path('numerology/predictive/', views.get_predictive_numerology, name='predictive-numerology'),
    
    # Generational Numerology endpoints
    path('numerology/generational/family-analysis/', views.generational_family_analysis, name='generational-family-analysis'),
    path('numerology/generational/family-analysis/get/', views.get_generational_family_analysis, name='get-generational-family-analysis'),
    path('numerology/generational/karmic-contract/', views.generational_karmic_contract, name='generational-karmic-contract'),
    path('numerology/generational/karmic-contracts/', views.get_karmic_contracts, name='get-karmic-contracts'),
    path('numerology/generational/patterns/', views.get_generational_patterns, name='get-generational-patterns'),
    path('numerology/generational/compatibility-matrix/', views.get_family_compatibility_matrix, name='get-family-compatibility-matrix'),
    
    # Feng Shui × Numerology Hybrid endpoints
    path('numerology/feng-shui/analyze/', views.feng_shui_analyze, name='feng-shui-analyze'),
    path('numerology/feng-shui/analysis/<uuid:analysis_id>/', views.get_feng_shui_analysis, name='get-feng-shui-analysis'),
    path('numerology/feng-shui/optimize-space/', views.feng_shui_optimize_space, name='feng-shui-optimize-space'),
    
    # Mental State AI × Numerology endpoints
    path('numerology/mental-state/track/', views.mental_state_track, name='mental-state-track'),
    path('numerology/mental-state/history/', views.get_mental_state_history, name='get-mental-state-history'),
    path('numerology/mental-state/analyze/', views.mental_state_analyze, name='mental-state-analyze'),
    path('numerology/mental-state/stress-patterns/', views.get_stress_patterns, name='get-stress-patterns'),
    path('numerology/mental-state/wellbeing-recommendations/', views.get_wellbeing_recommendations, name='get-wellbeing-recommendations'),
    path('numerology/mental-state/mood-predictions/', views.get_mood_predictions, name='get-mood-predictions'),
]