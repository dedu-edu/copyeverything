# to allow only permitted access
whitelist = {
    'core': {
        'SubOrgs': {
            'filter_fields': [],
            'search_fields': ['name'],
            'ordering_fields': [],
            'serializer_fields': ['id', 'name'],
            'methods': ['GET'],
        }
    },
	'lms': {
        'Season': {
            'filter_fields': [],
            'search_fields': ['season_name'],
            'ordering_fields': [],
            'serializer_fields': ['id', 'season_name'],
            'methods': ['GET'],
        },
        'SystemSettings': {
            'filter_fields': ['season_type'],
            'search_fields': [],
            'ordering_fields': [],
            'serializer_fields': ['start_date'],
            'methods': ['GET'],
        },
    },
}