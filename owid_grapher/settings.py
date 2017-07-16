"""
Django settings for owid_grapher project.

Generated by 'django-admin startproject' using Django 1.11.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.11/ref/settings/
"""

import os
import pymysql
from .secret_settings import SECRET_KEY, ENV, ALLOWED_HOSTS, BASE_URL, DB_HOST, DB_NAME, DB_PASS, DB_PORT, DB_USER, EMAIL_HOST, EMAIL_HOST_USER, EMAIL_USE_TLS, EMAIL_HOST_PASSWORD, EMAIL_PORT, CLOUDFLARE_BASE_URL, CLOUDFLARE_EMAIL, CLOUDFLARE_KEY, CLOUDFLARE_ZONE_ID, SLACK_TOKEN, SLACK_LOGGING_ENABLED, SLACK_CHANNEL, LOG_FILE_LOCATION, WDI_FETCHER_LOG_FILE_LOCATION, DATASETS_REPO_LOCATION, DATASETS_DIFF_HTML_LOCATION, DATASETS_REPO_EMAIL, DATASETS_REPO_USERNAME
pymysql.install_as_MySQLdb()


# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.11/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = SECRET_KEY

# SECURITY WARNING: don't run with debug turned on in production!
if ENV == 'development':
    DEBUG = True
elif ENV == 'production':
    DEBUG = False
else:
    DEBUG = False

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_slack',
    'crispy_forms',
    'grapher_admin',
    'importer',
    'country_name_tool',
    'django_extensions'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'grapher_admin.disable_cache_protect_admin.DisableCacheProtectAdminPages',
]

ROOT_URLCONF = 'owid_grapher.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': ['templates', 'owid_grapher/templates', 'owid_grapher/templatetags'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
            'libraries': {
                'webpack': 'owid_grapher.templatetags.webpack',
                'isdebug': 'owid_grapher.templatetags.isdebug',
                'rootrequest': 'owid_grapher.templatetags.rootrequest',
                'get_item': 'owid_grapher.templatefilters.get_item',
                },
        },
    },
]

WSGI_APPLICATION = 'owid_grapher.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'OPTIONS': {
            'sql_mode': 'traditional',
            'charset': 'utf8',
            'init_command': 'SET '
                'default_storage_engine=INNODB,'
                'character_set_connection=utf8,'
                'collation_connection=utf8_bin'
        },
        'NAME': DB_NAME,
        'USER': DB_USER,
        'PASSWORD': DB_PASS,
        'HOST': DB_HOST,
        'PORT': DB_PORT,
    }
}


# Password validation
# https://docs.djangoproject.com/en/1.11/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/1.11/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.11/howto/static-files/

STATIC_URL = '/grapher/public/'

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "public"),
]

AUTH_USER_MODEL = 'grapher_admin.User'

PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.BCryptPasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.Argon2PasswordHasher',
]

CRISPY_TEMPLATE_PACK = 'bootstrap3'

LOGIN_URL = '/grapher/admin/login'

LOGIN_REDIRECT_URL = '/grapher/'

ADMIN_ENABLED = False

if ENV == 'development':
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'  # For dev environment
    EMAIL_HOST = None
    EMAIL_PORT = None
    EMAIL_HOST_USER = None
    EMAIL_HOST_PASSWORD = None
    EMAIL_USE_TLS = None

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'standard': {
            'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
        },
    },
    'handlers': {
        'default': {
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': LOG_FILE_LOCATION,
            'maxBytes': 1024*1024*100,  # 100MB
            'backupCount': 5,
            'formatter': 'standard',
        },
        'wdi_fetcher': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': WDI_FETCHER_LOG_FILE_LOCATION,
            'formatter': 'standard',
        },
    },
    'loggers': {
        '': {
            'handlers': ['default'],
            'level': 'ERROR',
            'propagate': True
        },
        'importer': {
            'handlers': ['wdi_fetcher'],
            'level': 'DEBUG',
            'propagate': True
        },
    },
}

if SLACK_LOGGING_ENABLED:
    LOGGING['filters'] = {
            'require_debug_false': {
                '()': 'django.utils.log.RequireDebugFalse'
            }
        }
    LOGGING['handlers']['slack_admins'] = {
                'level': 'ERROR',
                'filters': ['require_debug_false'],
                'class': 'django_slack.log.SlackExceptionHandler'
            }
    LOGGING['loggers']['django'] = {
                'level': 'ERROR',
                'handlers': ['slack_admins']
            }
