"""
GraphQL schema for NumerAI API.
"""
import graphene
import graphql_jwt
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField
from graphql_jwt.decorators import login_required
from django.contrib.auth import get_user_model
from accounts.models import UserProfile
from numerology.models import NumerologyProfile, DailyReading
from consultations.models import Consultation
from payments.models import Subscription

User = get_user_model()


# User Types
class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'is_premium', 'subscription_plan')
        filter_fields = ['email', 'is_premium']
        interfaces = (graphene.relay.Node,)


class UserProfileType(DjangoObjectType):
    class Meta:
        model = UserProfile
        fields = '__all__'
        interfaces = (graphene.relay.Node,)


# Numerology Types
class NumerologyProfileType(DjangoObjectType):
    class Meta:
        model = NumerologyProfile
        fields = '__all__'
        filter_fields = ['user', 'system']
        interfaces = (graphene.relay.Node,)


class DailyReadingType(DjangoObjectType):
    class Meta:
        model = DailyReading
        fields = '__all__'
        filter_fields = ['user', 'reading_date']
        interfaces = (graphene.relay.Node,)


# Consultation Types
class ConsultationType(DjangoObjectType):
    class Meta:
        model = Consultation
        fields = '__all__'
        filter_fields = ['user', 'expert', 'status']
        interfaces = (graphene.relay.Node,)


# Subscription Types
class SubscriptionType(DjangoObjectType):
    class Meta:
        model = Subscription
        fields = '__all__'
        filter_fields = ['user', 'status']
        interfaces = (graphene.relay.Node,)


# Queries
class Query(graphene.ObjectType):
    # User queries
    me = graphene.Field(UserType)
    user = graphene.relay.Node.Field(UserType)
    users = DjangoFilterConnectionField(UserType)
    
    # Numerology queries
    numerology_profile = graphene.Field(NumerologyProfileType, user_id=graphene.UUID())
    daily_reading = graphene.Field(
        DailyReadingType,
        date=graphene.String(required=False)
    )
    daily_readings = DjangoFilterConnectionField(
        DailyReadingType,
        start_date=graphene.String(required=False),
        end_date=graphene.String(required=False)
    )
    
    # Consultation queries
    consultations = DjangoFilterConnectionField(ConsultationType)
    consultation = graphene.relay.Node.Field(ConsultationType)
    
    # Subscription queries
    subscription = graphene.Field(SubscriptionType)
    
    @login_required
    def resolve_me(self, info):
        """Get current authenticated user."""
        return info.context.user
    
    @login_required
    def resolve_numerology_profile(self, info, user_id=None):
        """Get numerology profile for user."""
        user = info.context.user
        target_user_id = user_id or user.id
        
        if target_user_id != user.id and not user.is_staff:
            raise Exception("Permission denied")
        
        try:
            return NumerologyProfile.objects.get(user_id=target_user_id)
        except NumerologyProfile.DoesNotExist:
            return None
    
    @login_required
    def resolve_daily_reading(self, info, date=None):
        """Get daily reading for authenticated user."""
        from datetime import date as date_obj
        from django.utils import timezone
        
        user = info.context.user
        reading_date = date or timezone.now().date()
        
        if isinstance(reading_date, str):
            reading_date = date_obj.fromisoformat(reading_date)
        
        try:
            return DailyReading.objects.get(user=user, reading_date=reading_date)
        except DailyReading.DoesNotExist:
            return None
    
    @login_required
    def resolve_daily_readings(self, info, start_date=None, end_date=None, **kwargs):
        """Get daily readings for authenticated user."""
        from datetime import date as date_obj
        from django.utils import timezone
        
        user = info.context.user
        queryset = DailyReading.objects.filter(user=user)
        
        if start_date:
            if isinstance(start_date, str):
                start_date = date_obj.fromisoformat(start_date)
            queryset = queryset.filter(reading_date__gte=start_date)
        
        if end_date:
            if isinstance(end_date, str):
                end_date = date_obj.fromisoformat(end_date)
            queryset = queryset.filter(reading_date__lte=end_date)
        
        return queryset.order_by('-reading_date')
    
    @login_required
    def resolve_consultations(self, info, **kwargs):
        """Get consultations for authenticated user."""
        user = info.context.user
        if user.is_staff:
            return Consultation.objects.all()
        return Consultation.objects.filter(user=user)
    
    @login_required
    def resolve_subscription(self, info):
        """Get subscription for authenticated user."""
        user = info.context.user
        try:
            return Subscription.objects.get(user=user, status='active')
        except Subscription.DoesNotExist:
            return None


# Mutations
class CalculateNumerologyProfile(graphene.Mutation):
    """Calculate numerology profile."""
    class Arguments:
        system = graphene.String(required=False, default_value='pythagorean')
    
    success = graphene.Boolean()
    profile = graphene.Field(NumerologyProfileType)
    message = graphene.String()
    
    @login_required
    def mutate(self, info, system='pythagorean'):
        """Calculate numerology profile."""
        from numerology.services.calculation_service import NumerologyCalculationService
        
        user = info.context.user
        service = NumerologyCalculationService()
        
        try:
            profile = service.calculate_profile(user, system=system)
            return CalculateNumerologyProfile(
                success=True,
                profile=profile,
                message="Profile calculated successfully"
            )
        except Exception as e:
            return CalculateNumerologyProfile(
                success=False,
                profile=None,
                message=str(e)
            )


class UpdateUserProfile(graphene.Mutation):
    """Update user profile."""
    class Arguments:
        full_name = graphene.String(required=False)
        date_of_birth = graphene.String(required=False)
        gender = graphene.String(required=False)
        timezone = graphene.String(required=False)
        location = graphene.String(required=False)
        bio = graphene.String(required=False)
    
    success = graphene.Boolean()
    user = graphene.Field(UserType)
    message = graphene.String()
    
    @login_required
    def mutate(self, info, **kwargs):
        """Update user profile."""
        user = info.context.user
        
        # Update user fields
        if 'full_name' in kwargs:
            user.full_name = kwargs['full_name']
            user.save(update_fields=['full_name'])
        
        # Get or create user profile
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        # Update profile fields
        if 'date_of_birth' in kwargs:
            from datetime import datetime
            profile.date_of_birth = datetime.fromisoformat(kwargs['date_of_birth']).date()
        if 'gender' in kwargs:
            profile.gender = kwargs['gender']
        if 'timezone' in kwargs:
            profile.timezone = kwargs['timezone']
        if 'location' in kwargs:
            profile.location = kwargs['location']
        if 'bio' in kwargs:
            profile.bio = kwargs['bio']
        
        profile.save()
        
        return UpdateUserProfile(
            success=True,
            user=user,
            message="Profile updated successfully"
        )


class Mutation(graphene.ObjectType):
    calculate_numerology_profile = CalculateNumerologyProfile.Field()
    update_user_profile = UpdateUserProfile.Field()
    # JWT mutations
    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()
    revoke_token = graphql_jwt.Revoke.Field()


# Create schema
schema = graphene.Schema(query=Query, mutation=Mutation)

