import boto3
import logging
from botocore.exceptions import ClientError, NoCredentialsError
from typing import Optional, BinaryIO
from app.config import get_settings

logger = logging.getLogger(__name__)


class S3Service:
    def __init__(self):
        self.settings = get_settings()
        self.s3_client = None
        self._initialize_s3_client()
    
    def _initialize_s3_client(self):
        """Initialize S3 client with credentials from settings"""
        try:
            if not all([
                self.settings.aws_access_key_id,
                self.settings.aws_secret_access_key,
                self.settings.s3_bucket_name
            ]):
                logger.warning("S3 credentials not fully configured. S3 operations will be disabled.")
                return
            
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=self.settings.aws_access_key_id,
                aws_secret_access_key=self.settings.aws_secret_access_key,
                region_name=self.settings.aws_region
            )
            
            # Test connection
            self.s3_client.head_bucket(Bucket=self.settings.s3_bucket_name)
            logger.info(f"Successfully connected to S3 bucket: {self.settings.s3_bucket_name}")
            
        except NoCredentialsError:
            logger.error("AWS credentials not found")
            self.s3_client = None
        except ClientError as e:
            logger.error(f"Error connecting to S3: {e}")
            self.s3_client = None
        except Exception as e:
            logger.error(f"Unexpected error initializing S3: {e}")
            self.s3_client = None
    
    def is_available(self) -> bool:
        """Check if S3 service is available"""
        return self.s3_client is not None
    
    def upload_file(self, file_obj: BinaryIO, key: str, content_type: str = None) -> bool:
        """
        Upload a file to S3 bucket
        
        Args:
            file_obj: File object to upload
            key: S3 object key (file path in bucket)
            content_type: MIME type of the file
            
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.is_available():
            logger.error("S3 service not available")
            return False
        
        try:
            extra_args = {}
            if content_type:
                extra_args['ContentType'] = content_type
            
            self.s3_client.upload_fileobj(
                file_obj,
                self.settings.s3_bucket_name,
                key,
                ExtraArgs=extra_args
            )
            logger.info(f"Successfully uploaded file to S3: {key}")
            return True
            
        except ClientError as e:
            logger.error(f"Error uploading file to S3: {e}")
            return False
    
    def download_file(self, key: str) -> Optional[bytes]:
        """
        Download a file from S3 bucket
        
        Args:
            key: S3 object key (file path in bucket)
            
        Returns:
            bytes: File content if successful, None otherwise
        """
        if not self.is_available():
            logger.error("S3 service not available")
            return None
        
        try:
            response = self.s3_client.get_object(
                Bucket=self.settings.s3_bucket_name,
                Key=key
            )
            return response['Body'].read()
            
        except ClientError as e:
            logger.error(f"Error downloading file from S3: {e}")
            return None
    
    def delete_file(self, key: str) -> bool:
        """
        Delete a file from S3 bucket
        
        Args:
            key: S3 object key (file path in bucket)
            
        Returns:
            bool: True if successful, False otherwise
        """
        if not self.is_available():
            logger.error("S3 service not available")
            return False
        
        try:
            self.s3_client.delete_object(
                Bucket=self.settings.s3_bucket_name,
                Key=key
            )
            logger.info(f"Successfully deleted file from S3: {key}")
            return True
            
        except ClientError as e:
            logger.error(f"Error deleting file from S3: {e}")
            return False
    
    def file_exists(self, key: str) -> bool:
        """
        Check if a file exists in S3 bucket
        
        Args:
            key: S3 object key (file path in bucket)
            
        Returns:
            bool: True if file exists, False otherwise
        """
        if not self.is_available():
            return False
        
        try:
            self.s3_client.head_object(
                Bucket=self.settings.s3_bucket_name,
                Key=key
            )
            return True
            
        except ClientError:
            return False
    
    def get_file_url(self, key: str, expiration: int = 3600) -> Optional[str]:
        """
        Generate a presigned URL for a file in S3
        
        Args:
            key: S3 object key (file path in bucket)
            expiration: URL expiration time in seconds (default: 1 hour)
            
        Returns:
            str: Presigned URL if successful, None otherwise
        """
        if not self.is_available():
            return None
        
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.settings.s3_bucket_name, 'Key': key},
                ExpiresIn=expiration
            )
            return url
            
        except ClientError as e:
            logger.error(f"Error generating presigned URL: {e}")
            return None


# Global S3 service instance
s3_service = S3Service()