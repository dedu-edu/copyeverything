import os
import shutil
import main

from django.conf import settings
from django.core.files.storage import FileSystemStorage


def file_exist(path):
    """ Файл байгаа эсэхийг шалгах
        return boolean
    """

    file_path = os.path.join(settings.MEDIA_ROOT, path)
    is_exist = False
    if os.path.exists(file_path):
        is_exist = True

    return is_exist


def save_file(file, folder, id='', use_cdn=False):
    """ Файл хадгалах
        path: Файл хадгалсан зам
        return path
    """
    file_name = file.name

    if use_cdn:
        path = os.path.join(folder, str(id))
        return [main.utils.function.utils.create_file_to_cdn(path, file).get('full_path')]

    path = os.path.join(settings.MEDIA_ROOT, folder, str(id))
    fs = FileSystemStorage(
        location=path
    )
    file_name = fs.save(file_name, file)

    # файл хадгалсан зам
    url = fs.path(file_name)

    # бааз руу хадгалагдах зам
    file_path = split_root_path(url)

    return file_path


def save_file_question(file, folder, id=''):
    """ Файл хадгалах
        path: Файл хадгалсан зам
        return path
    """
    file_name = file.name

    path = os.path.join(settings.MEDIA_ROOT, folder)
    if id:
        path = os.path.join(path, str(id))

    fs = FileSystemStorage(
        location=path
    )
    file_name = fs.save(file_name, file)

    # файл хадгалсан зам
    url = fs.path(file_name)

    # бааз руу хадгалагдах зам
    file_path = split_root_path(url)

    return file_path, url


def remove_folder(folder_path, use_cdn=False):
    """ Файл устгах
        delete_folder: Файл устгах зам
    """

    error = ''

    if use_cdn:
        try:
            main.utils.function.utils.remove_file_from_cdn(folder_path)

        except:
            pass

        return error

    if file_exist(folder_path):
        delete_folder = os.path.join(settings.MEDIA_ROOT, folder_path)
        try:
            shutil.rmtree(delete_folder)
        except Exception:
            os.remove(delete_folder)

    return error


def split_file_name(file_path):
    """ Path -аас файлын нэр хасах функц """

    splited_path = file_path.split('/')
    file_name = splited_path[-1]
    file_url = file_path.replace(file_name, '')
    return file_url


def split_root_path(file_path):
    ''' Path -аас MEDIA_ROOT хасах '''

    url = ''
    replace_path = settings.MEDIA_ROOT  + "/"
    url = file_path.replace(replace_path, '')

    return url


def check_file_ext(file_name, ext):
    ''' Файлын extension шалгах '''

    info = ''
    success = True
    if not file_name.endswith(ext):
        info = 'Заавал {} файл оруулах ёстой.'.format(ext)
        success = False

    return success, info


def get_name_from_path(path):
    """ Замнаас файлын нэрийг авах нь """
    return os.path.basename(path)


def create_folder(path):
    """ Фолдер үүсгэх
    """

    if not os.path.exists(path):
        os.makedirs(path)
