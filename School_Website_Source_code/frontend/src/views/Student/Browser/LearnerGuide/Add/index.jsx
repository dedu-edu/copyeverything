// ** React imports
import React, { Fragment, useContext, useEffect, useState } from 'react'

import { t } from 'i18next'

import useApi from '@hooks/useApi'
import useLoader from '@hooks/useLoader'

import { useForm, Controller } from 'react-hook-form'

import {
  Row,
  Col,
  Form,
  Modal,
  Input,
  Label,
  Button,
  ModalBody,
  FormFeedback,
  Spinner
} from 'reactstrap'

import { validate, convertDefaultValue } from '@utils'

import AuthContext from '@context/AuthContext'
import * as Yup from 'yup'
import { Download } from 'react-feather'
import ScrollSelectFilter from '@src/components/ScrollSelectFilter'

const CreateModal = ({
  open,
  handleModal,
  refreshDatas,
  editId,
  handleEditModal
}) => {
  const validateSchema = Yup.object().shape({
    title: Yup.string().trim().required('Хоосон байна')
  })

  const { user } = useContext(AuthContext)

  const [fileInputKey, setFileInputKey] = useState(0) //
  const [inputFile, setInputFile] = useState('')

  // ** Hook
  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
    setValue,
    watch
  } = useForm(validate(validateSchema))

  const file = watch('file')

  // Loader
  const { isLoading: getLoading, fetchData, Loader } = useLoader({})
  const { isLoading: saveLoading, fetchData: postFetch } = useLoader({})

  // Api
  const learnerGuideApi = useApi().browser.learnerGuide
  const professionApi = useApi().study.professionDefinition

  // Хадгалах
  async function onSubmit(cdata) {
    cdata = convertDefaultValue(cdata)
    cdata['profession'] = cdata['profession'].id

    const formData = new FormData()

    for (const key in cdata) {
      if (inputFile) {
        formData.append('file', inputFile)
      }
      formData.append(key, cdata[key])
    }

    if (editId) {
      const { success, errors } = await postFetch(
        learnerGuideApi.put(formData, editId)
      )
      if (success) {
        reset()
        refreshDatas()
        handleEditModal()
        setFileInputKey((prevKey) => prevKey + 1)
      } else {
        /** Алдааны мессэжийг input дээр харуулна */
        for (let key in errors) {
          setError(key, { type: 'custom', message: errors[key][0] })
        }
      }
    } else {
      const { success, errors } = await postFetch(
        learnerGuideApi.post(formData)
      )
      if (success) {
        reset()
        refreshDatas()
        handleModal()
        setFileInputKey((prevKey) => prevKey + 1)
      } else {
        if (errors && Object.keys(errors).length > 0) {
          /** Алдааны мессэжийг input дээр харуулна */
          for (let key in errors) {
            setError(key, { type: 'custom', message: errors[key][0] })
          }
        }
      }
    }
  }

  async function getOneDatas() {
    if (editId) {
      const { success, data } = await fetchData(learnerGuideApi.getOne(editId))
      if (success) {
        // засах үед дата байх юм бол setValue-р дамжуулан утгыг харуулна
        if (data === null) return

        for (const key in data) {
          if (data[key] === null) {
            setValue(key, '')
            continue
          }
          setValue(key, data[key])
        }
      }
    }
  }

  useEffect(() => {
    if (editId) {
      getOneDatas()
    }
  }, [open])

  return (
    <Fragment>
      {getLoading && Loader}
      <Modal
        isOpen={open}
        toggle={handleModal}
        className='modal-dialog-centered modal-lg'
        contentClassName='pt-1'
        backdrop='static'
      >
        <ModalBody className='px-sm-3 pt-50 pb-3'>
          <div className='text-center'>
            <h4>
              {editId
                ? t('Суралцагчийн гарын авлага засах')
                : t('Суралцагчийн гарын авлага нэмэх')}
            </h4>
          </div>
          <Row tag={Form} className='gy-1' onSubmit={handleSubmit(onSubmit)}>
            <Col md={12}>
              <Label className='form-label' for='profession'>
                {t('Хөтөлбөр')}
              </Label>
              <Controller
                defaultValue=''
                control={control}
                id='profession'
                name='profession'
                render={({ field: { ref, ...rest } }) => (
                  <ScrollSelectFilter
                    {...rest}
                    getApi={(page, search, limit) =>
                      professionApi.get(limit, page, '', search, '', '')
                    }
                    getOptionLabel={(option) =>
                      `${option.code} ${option.name}(${option.degree.degree_code})(${option.confirm_year})`
                    }
                    getOptionValue={(option) => option.id}
                  />
                )}
              />
              {errors.profession && (
                <FormFeedback className='d-block'>
                  {t(errors.profession.message)}
                </FormFeedback>
              )}
            </Col>
            <Col md={12}>
              <Label className='form-label' for='title'>
                {t('Гарчиг')}
              </Label>
              <Controller
                defaultValue=''
                control={control}
                id='title'
                name='title'
                render={({ field }) => (
                  <Input
                    {...field}
                    type='text'
                    name='title'
                    bsSize='sm'
                    id='title'
                    placeholder='гарчиг'
                    invalid={errors.title && true}
                  ></Input>
                )}
              />
              {errors.title && (
                <FormFeedback className='d-block'>
                  {t(errors.title.message)}
                </FormFeedback>
              )}
            </Col>
            <Col md={12}>
              <Label className='form-label'>{t('Файл')}</Label>
              <Controller
                defaultValue=''
                control={control}
                name='file'
                render={({ field }) => {
                  return (
                    <>
                      <Input
                        key={fileInputKey}
                        name={field.name}
                        id={field.name}
                        type='file'
                        placeholder={t('файл')}
                        onChange={(e) => {
                          setInputFile(e.target.files[0])
                        }}
                        accept='application/pdf'
                      />
                      {file && typeof file === 'string' && (
                        <>
                          <a href={file} className='me-1'>
                            <Download
                              type='button'
                              color='#1a75ff'
                              width={'15px'}
                            />
                          </a>
                          {file}
                        </>
                      )}
                    </>
                  )
                }}
              />
              {errors.file && (
                <FormFeedback className='d-block'>
                  {errors.file.message}
                </FormFeedback>
              )}
            </Col>
            <Col md={12} className='text-center mt-2'>
              <Button className='me-2' color='primary' type='submit'>
                {saveLoading && <Spinner size='sm' className='me-1' />}
                {t('Хадгалах')}
              </Button>
              <Button
                color='secondary'
                type='reset'
                outline
                onClick={handleModal}
              >
                {t('Буцах')}
              </Button>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    </Fragment>
  )
}
export default CreateModal
