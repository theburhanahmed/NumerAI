# Generated migration for DivineAPI-style numerology features

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('numerology', '0007_fengshuianalysis_spiritualnumerologyprofile_and_more'),
    ]

    operations = [
        # Add Birthday Number field
        migrations.AddField(
            model_name='numerologyprofile',
            name='birthday_number',
            field=models.IntegerField(blank=True, help_text='Inherent talents from birth day', null=True),
        ),
        # Add Driver Number field (Chaldean)
        migrations.AddField(
            model_name='numerologyprofile',
            name='driver_number',
            field=models.IntegerField(blank=True, help_text='Chaldean: Inner self/psychic number', null=True),
        ),
        # Add Conductor Number field (Chaldean)
        migrations.AddField(
            model_name='numerologyprofile',
            name='conductor_number',
            field=models.IntegerField(blank=True, help_text='Chaldean: Destiny/how others perceive you', null=True),
        ),
        # Add Personality Arrows field (Lo Shu Grid)
        migrations.AddField(
            model_name='numerologyprofile',
            name='personality_arrows',
            field=models.JSONField(blank=True, help_text='Detected personality arrows from Lo Shu Grid', null=True),
        ),
        # Add Zodiac Planet Data field
        migrations.AddField(
            model_name='numerologyprofile',
            name='zodiac_planet_data',
            field=models.JSONField(blank=True, help_text='Zodiac and planetary associations', null=True),
        ),
    ]

