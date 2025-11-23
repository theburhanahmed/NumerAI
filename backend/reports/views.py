"""
API views for NumerAI reports application.
"""
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.http import HttpResponse
from datetime import timedelta, date, datetime
from .models import ReportTemplate, GeneratedReport
from .serializers import (
    ReportTemplateSerializer, GeneratedReportSerializer
)
from numerology.models import Person, PersonNumerologyProfile
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import Table, TableStyle
import json
import uuid


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def report_templates_list(request):
    """Get list of available report templates."""
    # Get pagination params
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 10))
    
    # Get active templates
    templates = ReportTemplate.objects.filter(is_active=True).order_by('name')
    
    # Paginate
    start = (page - 1) * page_size
    end = start + page_size
    paginated_templates = templates[start:end]
    
    serializer = ReportTemplateSerializer(paginated_templates, many=True)
    
    return Response({
        'count': templates.count(),
        'page': page,
        'page_size': page_size,
        'results': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_report(request):
    """Generate a report for a person using a template."""
    user = request.user
    template_id = request.data.get('template_id')
    person_id = request.data.get('person_id')
    
    if not template_id or not person_id:
        return Response({
            'error': 'Template ID and Person ID are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get template
        template = ReportTemplate.objects.get(id=template_id, is_active=True)
    except ReportTemplate.DoesNotExist:
        return Response({
            'error': 'Template not found or not available'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get person
        person = Person.objects.get(id=person_id, user=user, is_active=True)
    except Person.DoesNotExist:
        return Response({
            'error': 'Person not found'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get person's numerology profile
        numerology_profile = PersonNumerologyProfile.objects.get(person=person)
    except PersonNumerologyProfile.DoesNotExist:
        return Response({
            'error': 'Numerology profile not found for this person. Please calculate it first.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Generate report content
        from .report_generator import generate_report_content
        content = generate_report_content(person, numerology_profile, template)
        
        # Create generated report
        report = GeneratedReport.objects.create(
            user=user,
            person=person,
            template=template,
            title=f"{template.name} for {person.name}",
            content=content,
            expires_at=timezone.now() + timedelta(days=30)  # Reports expire in 30 days
        )
        
        serializer = GeneratedReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({
            'error': f'Failed to generate report: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_generate_reports(request):
    """Generate multiple reports at once."""
    user = request.user
    template_id = request.data.get('template_id')
    person_ids = request.data.get('person_ids', [])
    
    if not template_id or not person_ids:
        return Response({
            'error': 'Template ID and at least one Person ID are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get template
        template = ReportTemplate.objects.get(id=template_id, is_active=True)
    except ReportTemplate.DoesNotExist:
        return Response({
            'error': 'Template not found or not available'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    generated_reports = []
    errors = []
    
    for person_id in person_ids:
        try:
            # Get person
            person = Person.objects.get(id=person_id, user=user, is_active=True)
        except Person.DoesNotExist:
            errors.append(f"Person {person_id} not found")
            continue
        
        try:
            # Get person's numerology profile
            numerology_profile = PersonNumerologyProfile.objects.get(person=person)
        except PersonNumerologyProfile.DoesNotExist:
            errors.append(f"Numerology profile not found for person {person.name}")
            continue
        
        try:
            # Check if report already exists
            existing_report = GeneratedReport.objects.filter(
                user=user,
                person=person,
                template=template,
                expires_at__gt=timezone.now()
            ).first()
            
            if existing_report:
                generated_reports.append(existing_report)
                continue
            
            # Generate report content
            from .report_generator import generate_report_content
            content = generate_report_content(person, numerology_profile, template)
            
            # Create generated report
            report = GeneratedReport.objects.create(
                user=user,
                person=person,
                template=template,
                title=f"{template.name} for {person.name}",
                content=content,
                expires_at=timezone.now() + timedelta(days=30)
            )
            
            generated_reports.append(report)
            
        except Exception as e:
            errors.append(f"Failed to generate report for {person.name}: {str(e)}")
    
    # Serialize results
    serializer = GeneratedReportSerializer(generated_reports, many=True)
    
    response_data = {
        'generated_reports': serializer.data,
        'count': len(generated_reports),
        'errors': errors
    }
    
    return Response(response_data, status=status.HTTP_200_OK if not errors else status.HTTP_207_MULTI_STATUS)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_generated_reports(request):
    """Get user's generated reports."""
    user = request.user
    
    # Get pagination params
    page = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('page_size', 10))
    
    # Get reports
    reports = GeneratedReport.objects.filter(user=user).order_by('-generated_at')
    
    # Paginate
    start = (page - 1) * page_size
    end = start + page_size
    paginated_reports = reports[start:end]
    
    serializer = GeneratedReportSerializer(paginated_reports, many=True)
    
    return Response({
        'count': reports.count(),
        'page': page,
        'page_size': page_size,
        'results': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_generated_report(request, report_id):
    """Get a specific generated report."""
    user = request.user
    
    try:
        report = GeneratedReport.objects.get(id=report_id, user=user)
        serializer = GeneratedReportSerializer(report)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except GeneratedReport.DoesNotExist:
        return Response({
            'error': 'Report not found'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_generated_report_pdf(request, report_id):
    """Export a generated report as PDF."""
    user = request.user
    
    try:
        report = GeneratedReport.objects.get(id=report_id, user=user)
    except GeneratedReport.DoesNotExist:
        return Response({
            'error': 'Report not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Check if report has expired
    if report.expires_at and report.expires_at < timezone.now():
        return Response({
            'error': 'Report has expired'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Create PDF response
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{report.title.replace(" ", "_")}.pdf"'
    
    # Create PDF document
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Title
    p.setFont("Helvetica-Bold", 24)
    p.drawString(50, height - 50, report.title)
    
    # Report info
    p.setFont("Helvetica", 12)
    p.drawString(50, height - 80, f"Generated for: {report.person.name}")
    p.drawString(50, height - 100, f"Date of Birth: {report.person.birth_date}")
    p.drawString(50, height - 120, f"Generated on: {report.generated_at.strftime('%Y-%m-%d')}")
    
    # Report content (simplified display)
    y_position = height - 160
    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, y_position, "Report Summary")
    
    y_position -= 30
    p.setFont("Helvetica", 12)
    
    # Display key information from content
    if isinstance(report.content, dict):
        content = report.content
    else:
        content = json.loads(report.content) if isinstance(report.content, str) else {}
    
    # Display summary if available
    if 'summary' in content:
        p.drawString(70, y_position, f"Summary: {content['summary']}")
        y_position -= 20
    
    # Display key numbers if available
    if 'numbers' in content:
        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, y_position, "Key Numbers")
        y_position -= 20
        p.setFont("Helvetica", 12)
        
        numbers = content['numbers']
        for key, value in numbers.items():
            if y_position < 100:  # Start new page if needed
                p.showPage()
                y_position = height - 50
            
            p.drawString(70, y_position, f"{key.replace('_', ' ').title()}: {value}")
            y_position -= 15
    
    # Footer
    p.setFont("Helvetica", 10)
    p.drawString(50, 50, "Generated by NumerAI - Your Personal Numerology Guide")
    
    p.showPage()
    p.save()
    
    # Get the value of the BytesIO buffer and write it to the response
    pdf = buffer.getvalue()
    buffer.close()
    response.write(pdf)
    return response


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint."""
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now().isoformat()
    }, status=status.HTTP_200_OK)