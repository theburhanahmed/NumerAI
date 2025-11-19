from django.db import migrations, models
import django.db.models.deletion
import uuid
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_fix_index_naming_issue'),
    ]

    operations = [
        migrations.CreateModel(
            name='GeneratedReport',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=200)),
                ('content', models.JSONField()),
                ('generated_at', models.DateTimeField(auto_now_add=True)),
                ('expires_at', models.DateTimeField(blank=True, null=True)),
            ],
            options={
                'verbose_name': 'Generated Report',
                'verbose_name_plural': 'Generated Reports',
                'db_table': 'generated_reports',
                'ordering': ['-generated_at'],
            },
        ),
        migrations.CreateModel(
            name='Person',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('birth_date', models.DateField()),
                ('relationship', models.CharField(choices=[('self', 'Self'), ('spouse', 'Spouse'), ('child', 'Child'), ('parent', 'Parent'), ('sibling', 'Sibling'), ('friend', 'Friend'), ('colleague', 'Colleague'), ('partner', 'Business Partner'), ('other', 'Other')], default='other', max_length=20)),
                ('notes', models.TextField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='people', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Person',
                'verbose_name_plural': 'People',
                'db_table': 'people',
                'ordering': ['name'],
                'unique_together': {('user', 'name', 'birth_date')},
            },
        ),
        migrations.CreateModel(
            name='PersonNumerologyProfile',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('life_path_number', models.IntegerField()),
                ('destiny_number', models.IntegerField()),
                ('soul_urge_number', models.IntegerField()),
                ('personality_number', models.IntegerField()),
                ('attitude_number', models.IntegerField()),
                ('maturity_number', models.IntegerField()),
                ('balance_number', models.IntegerField()),
                ('personal_year_number', models.IntegerField()),
                ('personal_month_number', models.IntegerField()),
                ('calculation_system', models.CharField(choices=[('pythagorean', 'Pythagorean'), ('chaldean', 'Chaldean')], default='pythagorean', max_length=20)),
                ('calculated_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Person Numerology Profile',
                'verbose_name_plural': 'Person Numerology Profiles',
                'db_table': 'person_numerology_profiles',
            },
        ),
        migrations.CreateModel(
            name='ReportTemplate',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('report_type', models.CharField(choices=[('basic', 'Basic Birth Chart'), ('detailed', 'Detailed Analysis'), ('compatibility', 'Compatibility Report'), ('career', 'Career Guidance'), ('relationship', 'Relationship Analysis'), ('health', 'Health Insights'), ('finance', 'Financial Forecast'), ('yearly', 'Yearly Forecast'), ('monthly', 'Monthly Guidance'), ('daily', 'Daily Reading')], max_length=20)),
                ('is_premium', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Report Template',
                'verbose_name_plural': 'Report Templates',
                'db_table': 'report_templates',
                'ordering': ['name'],
            },
        ),
        # Add indexes for new models
        migrations.AddIndex(
            model_name='reporttemplate',
            index=models.Index(fields=['report_type', 'is_active'], name='report_temp_report__fe6a31_idx'),
        ),
        migrations.AddIndex(
            model_name='reporttemplate',
            index=models.Index(fields=['is_premium'], name='report_temp_is_prem_87d0cb_idx'),
        ),
        # Add foreign key relationships
        migrations.AddField(
            model_name='personnumerologyprofile',
            name='person',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='numerology_profile', to='core.person'),
        ),

        migrations.AddField(
            model_name='generatedreport',
            name='person',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reports', to='core.person'),
        ),
        migrations.AddField(
            model_name='generatedreport',
            name='template',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reports', to='core.reporttemplate'),
        ),
        migrations.AddField(
            model_name='generatedreport',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='generated_reports', to=settings.AUTH_USER_MODEL),
        ),
        # Add indexes for new models
        migrations.AddIndex(
            model_name='person',
            index=models.Index(fields=['user', 'is_active'], name='people_user_id_ed3efb_idx'),
        ),
        migrations.AddIndex(
            model_name='person',
            index=models.Index(fields=['relationship'], name='people_relatio_09226c_idx'),
        ),
        migrations.AddIndex(
            model_name='generatedreport',
            index=models.Index(fields=['user', 'generated_at'], name='generated_r_user_id_33f950_idx'),
        ),
        migrations.AddIndex(
            model_name='generatedreport',
            index=models.Index(fields=['person', 'template'], name='generated_r_person__455f5f_idx'),
        ),
    ]