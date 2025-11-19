from django.db import migrations
from django.db import connection


def safe_rename_indexes(apps, schema_editor):
    """
    Safely rename indexes only if they exist.
    This prevents errors when deploying to environments where indexes may not exist.
    """
    with connection.cursor() as cursor:
        # List of old_index_name, new_index_name pairs
        index_renames = [
            # CompatibilityCheck indexes
            ('compatibilit_user_id_3f8b4a_idx', 'compatibili_user_id_cae1ee_idx'),
            ('compatibilit_relation_2e8b4a_idx', 'compatibili_relatio_cd3cc4_idx'),
            
            # Consultation indexes
            ('core_consul_user_id_3f8b4a_idx', 'consultatio_user_id_68d40d_idx'),
            ('core_consul_expert__4e8b4a_idx', 'consultatio_expert__73f6b2_idx'),
            ('core_consul_status_3f8b4a_idx', 'consultatio_status_beb187_idx'),
            
            # ConsultationReview indexes
            ('consultatio_consulta_3f8b4a_idx', 'consultatio_consult_83762f_idx'),
            ('consultatio_rating_3f8b4a_idx', 'consultatio_rating_8fcb28_idx'),
            
            # Expert indexes
            ('core_exper_special_3f8b4a_idx', 'experts_special_61ffdd_idx'),
            ('core_exper_rating_3f8b4a_idx', 'experts_rating_47b7e6_idx'),
            
            # Remedy indexes
            ('core_remedy_user_id_3f8b4a_idx', 'remedies_user_id_136d3e_idx'),
            ('core_remedy_is_acti_3f8b4a_idx', 'remedies_is_acti_41f20b_idx'),
            
            # RemedyTracking indexes
            ('remedy_trac_user_id_3f8b4a_idx', 'remedy_trac_user_id_d27392_idx'),
            ('remedy_trac_remedy__4e8b4a_idx', 'remedy_trac_remedy__aef8b5_idx'),
        ]
        
        # Get existing indexes for each table
        tables = [
            'compatibility_checks', 'consultations', 'consultation_reviews',
            'experts', 'remedies', 'remedy_trackings'
        ]
        
        existing_indexes = set()
        for table in tables:
            try:
                cursor.execute("""
                    SELECT indexname FROM pg_indexes 
                    WHERE schemaname = 'public' AND tablename = %s
                """, [table])
                for row in cursor.fetchall():
                    existing_indexes.add(row[0])
            except Exception as e:
                # If we can't get indexes for a table, continue with the next one
                print(f"Warning: Could not fetch indexes for table {table}: {e}")
                continue
        
        # Rename indexes that exist
        for old_name, new_name in index_renames:
            if old_name in existing_indexes and new_name not in existing_indexes:
                try:
                    cursor.execute(f"ALTER INDEX {old_name} RENAME TO {new_name}")
                    print(f"Successfully renamed index {old_name} to {new_name}")
                except Exception as e:
                    # Log the error but continue - this prevents deployment from failing
                    # In production, this might happen if the index doesn't exist
                    print(f"Warning: Could not rename index {old_name} to {new_name}: {e}")
                    pass


def reverse_safe_rename_indexes(apps, schema_editor):
    """Reverse the index renames if needed."""
    with connection.cursor() as cursor:
        # List of new_index_name, old_index_name pairs (reverse of above)
        index_renames = [
            # CompatibilityCheck indexes
            ('compatibili_user_id_cae1ee_idx', 'compatibilit_user_id_3f8b4a_idx'),
            ('compatibili_relatio_cd3cc4_idx', 'compatibilit_relation_2e8b4a_idx'),
            
            # Consultation indexes
            ('consultatio_user_id_68d40d_idx', 'core_consul_user_id_3f8b4a_idx'),
            ('consultatio_expert__73f6b2_idx', 'core_consul_expert__4e8b4a_idx'),
            ('consultatio_status_beb187_idx', 'core_consul_status_3f8b4a_idx'),
            
            # ConsultationReview indexes
            ('consultatio_consult_83762f_idx', 'consultatio_consulta_3f8b4a_idx'),
            ('consultatio_rating_8fcb28_idx', 'consultatio_rating_3f8b4a_idx'),
            
            # Expert indexes
            ('experts_special_61ffdd_idx', 'core_exper_special_3f8b4a_idx'),
            ('experts_rating_47b7e6_idx', 'core_exper_rating_3f8b4a_idx'),
            
            # Remedy indexes
            ('remedies_user_id_136d3e_idx', 'core_remedy_user_id_3f8b4a_idx'),
            ('remedies_is_acti_41f20b_idx', 'core_remedy_is_acti_3f8b4a_idx'),
            
            # RemedyTracking indexes
            ('remedy_trac_user_id_d27392_idx', 'remedy_trac_user_id_3f8b4a_idx'),
            ('remedy_trac_remedy__aef8b5_idx', 'remedy_trac_remedy__4e8b4a_idx'),
        ]
        
        # Get existing indexes for each table
        tables = [
            'compatibility_checks', 'consultations', 'consultation_reviews',
            'experts', 'remedies', 'remedy_trackings'
        ]
        
        existing_indexes = set()
        for table in tables:
            try:
                cursor.execute("""
                    SELECT indexname FROM pg_indexes 
                    WHERE schemaname = 'public' AND tablename = %s
                """, [table])
                for row in cursor.fetchall():
                    existing_indexes.add(row[0])
            except Exception as e:
                # If we can't get indexes for a table, continue with the next one
                print(f"Warning: Could not fetch indexes for table {table}: {e}")
                continue
        
        # Rename indexes that exist
        for old_name, new_name in index_renames:
            if old_name in existing_indexes and new_name not in existing_indexes:
                try:
                    cursor.execute(f"ALTER INDEX {old_name} RENAME TO {new_name}")
                    print(f"Successfully renamed index {old_name} to {new_name}")
                except Exception as e:
                    # Log the error but continue - this prevents deployment from failing
                    # In production, this might happen if the index doesn't exist
                    print(f"Warning: Could not rename index {old_name} to {new_name}: {e}")
                    pass


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_add_numerology_fields'),
    ]

    operations = [
        migrations.RunPython(safe_rename_indexes, reverse_safe_rename_indexes),
    ]