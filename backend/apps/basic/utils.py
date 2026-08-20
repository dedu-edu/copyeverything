
from rest_framework import serializers


def parse_model_name(instance, whitelist):
	model = instance.kwargs.get('model')

	if not model:
		raise Exception('no model specified')

	model = model.split('_')
	app_name = model[0]
	model_name = '_'.join(model[1:])

	if not (app_name in whitelist and model_name in whitelist[app_name]):
		raise Exception('access denied')

	return app_name, model_name


def get_allowed_fields(request_keys, whitelist_key, app_name, model_name, whitelist):
	allowed_fields = []

	for request_key in request_keys:
		if request_key in whitelist[app_name][model_name][whitelist_key]:
			allowed_fields.append(request_key)

	if not allowed_fields:
		allowed_fields = whitelist[app_name][model_name][whitelist_key]

	return allowed_fields


def dynamic_serializer(c_model, c_fields, c_depth=0):
    c_depth = int(c_depth)
    assert c_depth >= 0

    class CustomSerializer(serializers.ModelSerializer):
        class Meta:
            model = c_model
            fields = c_fields
            depth= c_depth

    return CustomSerializer
