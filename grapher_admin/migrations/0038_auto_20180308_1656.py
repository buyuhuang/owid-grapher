# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2018-03-08 16:56
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('grapher_admin', '0037_auto_20180308_0706'),
    ]

    operations = [
        migrations.RenameField('DataValue', 'fk_ent_id', 'entityId')
    ]
