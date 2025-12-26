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
    path('numerology/lo-shu-grid/arrows/', views.get_lo_shu_arrows, name='lo-shu-grid-arrows'),
    path('numerology/lo-shu-grid/remedies/', views.get_lo_shu_remedies, name='lo-shu-grid-remedies'),
    path('numerology/lo-shu-grid/compare/', views.compare_lo_shu_grids, name='lo-shu-grid-compare'),
    path('numerology/lo-shu-grid/visualization/', views.get_lo_shu_visualization, name='lo-shu-grid-visualization'),
    
    # Pinnacles and Challenges
    path('numerology/pinnacles/detailed/', views.get_pinnacles_detailed, name='pinnacles-detailed'),
    path('numerology/pinnacles/timeline/', views.get_pinnacles_timeline, name='pinnacles-timeline'),
    path('numerology/challenges/remedies/', views.get_challenge_remedies, name='challenge-remedies'),
    
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
    path('numerology/essence-transitions/', views.analyze_essence_transitions, name='essence-transitions'),
    path('numerology/essence-forecast/', views.forecast_essence_trends, name='essence-forecast'),
    path('numerology/cycle-timeline/', views.get_cycle_timeline, name='cycle-timeline'),
    path('numerology/universal-cycles/', views.get_universal_cycles, name='universal-cycles'),
    path('numerology/cycle-compatibility/', views.calculate_cycle_compatibility, name='cycle-compatibility'),
    path('numerology/compatibility/detailed/', views.detailed_compatibility_breakdown, name='detailed-compatibility'),
    path('numerology/compatibility/timeline/', views.relationship_timeline_predictions, name='compatibility-timeline'),
    path('numerology/compatibility/conflict-resolution/', views.conflict_resolution_guidance, name='conflict-resolution'),
    path('numerology/compatibility/communication/', views.communication_style_analysis, name='communication-analysis'),
    path('numerology/personal-hour/', views.get_personal_hour, name='personal-hour'),
    path('numerology/cycle-transitions/', views.get_cycle_transitions, name='cycle-transitions'),
    path('numerology/cycle-alerts/', views.get_cycle_alerts, name='cycle-alerts'),
    
    # Asset Numerology endpoints
    path('numerology/vehicle/', views.calculate_vehicle_numerology, name='vehicle-numerology'),
    path('numerology/property/', views.calculate_property_numerology, name='property-numerology'),
    path('numerology/business/', views.calculate_business_numerology, name='business-numerology'),
    path('numerology/business/optimize-name/', views.optimize_business_name, name='optimize-business-name'),
    path('numerology/business/launch-dates/', views.calculate_launch_dates, name='calculate-launch-dates'),
    path('numerology/business/cycles/', views.analyze_business_cycles, name='analyze-business-cycles'),
    path('numerology/business/financial-timing/', views.calculate_financial_timing, name='financial-timing'),
    path('numerology/business/team-analysis/', views.analyze_team_compatibility, name='team-analysis'),
    path('numerology/phone-asset/', views.calculate_phone_numerology_asset, name='phone-asset-numerology'),
    
    # Relationship Numerology endpoints
    path('numerology/relationship/enhanced-compatibility/', views.calculate_enhanced_compatibility, name='enhanced-compatibility'),
    path('numerology/relationship/compare-partners/', views.compare_multiple_partners, name='compare-partners'),
    path('numerology/relationship/marriage-harmony/', views.calculate_marriage_harmony_cycles, name='marriage-harmony'),
    path('numerology/relationship/sexual-energy/', views.calculate_sexual_energy, name='sexual-energy'),
    path('numerology/relationship/breakup-risks/', views.predict_breakup_risks, name='breakup-risks'),
    path('numerology/relationship/timing/', views.optimize_relationship_timing, name='relationship-timing'),
    path('numerology/relationship/health-tracking/', views.track_relationship_health, name='relationship-health'),
    path('numerology/relationship/growth-tips/', views.get_relationship_growth_tips, name='relationship-growth-tips'),
    
    # Timing Numerology endpoints
    path('numerology/timing/best-dates/', views.find_best_dates, name='find-best-dates'),
    path('numerology/timing/danger-dates/', views.find_danger_dates, name='find-danger-dates'),
    path('numerology/timing/optimize/', views.optimize_event_timing, name='optimize-event-timing'),
    path('numerology/timing/global-influences/', views.analyze_global_influences, name='global-influences'),
    path('numerology/timing/compatibility/', views.calculate_timing_compatibility, name='timing-compatibility'),
    
    # Health Numerology endpoints
    path('numerology/health/', views.get_health_numerology, name='health-numerology'),
    path('numerology/health/analysis/', views.get_health_analysis, name='health-analysis'),
    path('numerology/health/cycles/', views.calculate_health_cycles, name='health-cycles'),
    path('numerology/health/risk-periods/', views.get_health_risk_periods, name='health-risk-periods'),
    path('numerology/health/medical-timing/', views.calculate_medical_timing, name='medical-timing'),
    path('numerology/health/compatibility/', views.analyze_health_compatibility, name='health-compatibility'),
    path('numerology/health/emotional-vulnerabilities/', views.calculate_emotional_vulnerabilities, name='emotional-vulnerabilities'),
    
    # Name Correction endpoints
    path('numerology/name/suggestions/', views.generate_name_suggestions, name='name-suggestions'),
    path('numerology/name/optimize/', views.optimize_name_vibration, name='optimize-name'),
    path('numerology/name/phonetic-analysis/', views.analyze_phonetic_compatibility, name='phonetic-analysis'),
    path('numerology/name/change-timing/', views.calculate_name_change_timing, name='name-change-timing'),
    path('numerology/name/compare/', views.compare_name_variations, name='compare-name-variations'),
    path('numerology/name-correction/', views.analyze_name_correction, name='name-correction'),
    
    # Spiritual Numerology endpoints
    path('numerology/spiritual/', views.get_spiritual_numerology, name='spiritual-numerology'),
    path('numerology/spiritual/soul-contracts/', views.get_soul_contracts, name='spiritual-soul-contracts'),
    path('numerology/spiritual/karmic-timeline/', views.get_karmic_timeline, name='spiritual-karmic-timeline'),
    path('numerology/spiritual/rebirth-cycles/', views.get_rebirth_cycles, name='spiritual-rebirth-cycles'),
    path('numerology/spiritual/divine-gifts/', views.get_divine_gifts, name='spiritual-divine-gifts'),
    path('numerology/spiritual/meditation-timing/', views.get_meditation_timing, name='spiritual-meditation-timing'),
    
    # Predictive Numerology endpoints
    path('numerology/predictive/', views.get_predictive_numerology, name='predictive-numerology'),
    path('numerology/predictive/9-year-cycle/', views.get_9_year_cycle, name='predictive-9-year-cycle'),
    path('numerology/predictive/breakthrough-years/', views.get_breakthrough_years, name='predictive-breakthrough-years'),
    path('numerology/predictive/crisis-years/', views.get_crisis_years, name='predictive-crisis-years'),
    path('numerology/predictive/opportunities/', views.get_opportunity_periods, name='predictive-opportunities'),
    path('numerology/predictive/milestones/', views.get_life_milestones, name='predictive-milestones'),
    path('numerology/predictive/yearly-forecast/', views.get_yearly_forecast, name='predictive-yearly-forecast'),
    
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
    path('numerology/feng-shui/energy-flow/', views.get_energy_flow, name='feng-shui-energy-flow'),
    path('numerology/feng-shui/room-numbers/', views.get_room_numerology, name='feng-shui-room-numbers'),
    path('numerology/feng-shui/directions/', views.check_direction_compatibility, name='feng-shui-directions'),
    
    # Mental State AI × Numerology endpoints
    path('numerology/mental-state/track/', views.mental_state_track, name='mental-state-track'),
    path('numerology/mental-state/history/', views.get_mental_state_history, name='get-mental-state-history'),
    path('numerology/mental-state/analyze/', views.mental_state_analyze, name='mental-state-analyze'),
    path('numerology/mental-state/stress-patterns/', views.get_stress_patterns, name='get-stress-patterns'),
    path('numerology/mental-state/wellbeing-recommendations/', views.get_wellbeing_recommendations, name='get-wellbeing-recommendations'),
    path('numerology/mental-state/mood-predictions/', views.get_mood_predictions, name='get-mood-predictions'),
    path('numerology/mental-state/emotional-compatibility/', views.get_emotional_compatibility, name='emotional-compatibility'),
    
    # DivineAPI-Style Endpoints (Chaldean Analysis, Enhanced Lo Shu, Zodiac)
    path('numerology/chaldean-analysis/', views.get_chaldean_analysis, name='chaldean-analysis'),
    path('numerology/lo-shu-grid/detailed/', views.get_detailed_lo_shu_grid, name='detailed-lo-shu-grid'),
    path('numerology/zodiac-planet/', views.get_zodiac_numerology, name='zodiac-numerology'),
    path('numerology/attitude-number/', views.get_enhanced_attitude_number, name='enhanced-attitude-number'),
    path('numerology/core-numbers/', views.get_complete_core_numbers, name='complete-core-numbers'),
    
    # Visualization endpoints
    path('numerology/visualizations/wheel/', views.get_numerology_wheel, name='numerology-wheel'),
    path('numerology/visualizations/timeline/', views.get_numerology_timeline, name='numerology-timeline'),
    path('numerology/visualizations/comparison/', views.get_numerology_comparison_charts, name='numerology-comparison'),
    path('numerology/visualizations/heatmap/', views.get_numerology_heatmap, name='numerology-heatmap'),
    path('numerology/visualizations/3d/', views.get_3d_numerology_visualization, name='numerology-3d'),
    
    # Enhanced Remedies endpoints
    path('numerology/remedies/track/<uuid:remedy_id>/', views.get_remedy_tracking_data, name='get-remedy-tracking'),
    path('numerology/remedies/track/<uuid:remedy_id>/effectiveness/', views.submit_remedy_effectiveness, name='submit-remedy-effectiveness'),
    path('numerology/remedies/effectiveness/', views.get_remedy_effectiveness, name='get-remedy-effectiveness'),
    path('numerology/remedies/combinations/', views.get_remedy_combinations, name='get-remedy-combinations'),
    path('numerology/remedies/reminders/', views.create_remedy_reminder, name='create-remedy-reminder'),
    path('numerology/remedies/reminders/list/', views.get_remedy_reminders, name='get-remedy-reminders'),
    path('numerology/remedies/reminders/<uuid:reminder_id>/', views.delete_remedy_reminder, name='delete-remedy-reminder'),
    
    # Dashboard endpoints
    path('numerology/dashboard/insights/', views.get_dashboard_insights, name='dashboard-insights'),
    path('numerology/dashboard/quick-actions/', views.get_dashboard_quick_actions, name='dashboard-quick-actions'),
    path('numerology/dashboard/activity/', views.get_dashboard_activity, name='dashboard-activity'),
    path('numerology/dashboard/recommendations/', views.get_dashboard_recommendations, name='dashboard-recommendations'),
]