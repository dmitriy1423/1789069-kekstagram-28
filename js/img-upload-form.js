import { isEscapeKey } from './util.js';
import { uploadForm, successMessageTemplate, errorMessageTemplate, hashtagsInput, commentInput,
  imgUploadPreview, SubmitButtonText } from './constants.js';
import { sendData } from './load.js';
import { setPreviewImage } from './preview-image.js';
import { pristine } from './validate.js';

const successMessageElement = successMessageTemplate.cloneNode(true);
const successMessageButton = successMessageElement.querySelector('.success__button');

const errorMessageElement = errorMessageTemplate.cloneNode(true);
const errorMessageButton = errorMessageElement.querySelector('.error__button');

const uploadOverlay = uploadForm.querySelector('.img-upload__overlay');

const closeUploadForm = uploadForm.querySelector('.img-upload__cancel');
const submitButton = uploadForm.querySelector('.img-upload__submit');

const scaleControl = uploadForm.querySelector('.scale__control--value');
const scaleControlSmaller = uploadForm.querySelector('.scale__control--smaller');
const scaleControlBigger = uploadForm.querySelector('.scale__control--bigger');

const sliderFieldset = uploadForm.querySelector('.img-upload__effect-level');
const sliderElement = uploadForm.querySelector('.effect-level__slider');
const imgEffectValue = uploadForm.querySelector('.effect-level__value');
const effectsList = uploadForm.querySelector('.effects__list');

let slider;
let isShowErrorMessage = false;

const setEffect = () => {
  const effectValue = uploadOverlay.querySelector('.effects__radio:checked').value;
  const rangeValue = Number(imgEffectValue.value);
  let filter = effectValue;

  switch (effectValue) {
    case 'chrome':
      filter = `grayscale(${rangeValue})`;
      break;
    case 'sepia':
      filter = `sepia(${rangeValue})`;
      break;
    case 'marvin':
      filter = `invert(${rangeValue}%)`;
      break;
    case 'phobos':
      filter = `blur(${rangeValue * 3}px)`;
      break;
    case 'heat':
      filter = `brightness(${rangeValue * 2 + 1})`;
      break;
    default:
      break;
  }

  if (filter === 'none') {
    imgUploadPreview.style.filter = '';
    imgEffectValue.value = '';
    sliderFieldset.classList.add('hidden');
  } else {
    sliderFieldset.classList.remove('hidden');
  }

  imgUploadPreview.style.filter = filter;
};

const initialSlider = () => {
  noUiSlider.create(sliderElement, {
    range: {
      min: 0,
      max: 1
    },
    start: 0,
    step: 0.1,
    connect: 'lower',
    format: {
      to: function (value) {
        if (Number.isInteger(value)) {
          return value.toFixed(0);
        }
        return value.toFixed(1);
      },
      from: function(value) {
        return parseFloat(value);
      }
    }
  });
  sliderElement.noUiSlider.set(100);
  sliderElement.noUiSlider.on('update', () => {
    imgEffectValue.value = sliderElement.noUiSlider.get();
    setEffect();
  });

  return sliderElement;
};

const destroySlider = () => {
  sliderElement.noUiSlider.destroy();
  slider = null;
};

const onChangeEffect = (evt) => {
  if (!slider) {
    slider = initialSlider();
  }
  if (evt.target.value === 'marvin') {
    slider.noUiSlider.updateOptions({
      range: {
        min: 0,
        max: 100
      },
      step: 1
    });
  } else {
    slider.noUiSlider.updateOptions({
      range: {
        min: 0,
        max: 1
      },
      step: 0.1
    });
  }

  slider.noUiSlider.set(100);
  if (evt.target.value === 'none') {
    destroySlider();
  }

  setEffect();
};

const onFormKeydown = (evt) => {
  if (!isShowErrorMessage) {
    if (isEscapeKey(evt)) {
      evt.preventDefault();
      closeForm();
    }
  }
};

const cancelCloseForm = (evt) => {
  evt.stopPropagation();
};

const onSuccessMessageKeydown = (evt) => {
  if (isEscapeKey(evt)) {
    closeSuccessMessage();
  }
};

const onClickSuccessMessageOutside = (evt) => {
  if (evt.target.parentNode === document.body) {
    closeSuccessMessage();
  }
};

function closeSuccessMessage () {
  successMessageElement.remove();
  document.body.removeEventListener('click', onClickSuccessMessageOutside);
  document.body.removeEventListener('keydown', onSuccessMessageKeydown);
}

const showSuccessMessage = () => {
  successMessageButton.addEventListener('click', closeSuccessMessage);
  document.body.addEventListener('keydown', onSuccessMessageKeydown);
  document.body.addEventListener('click', onClickSuccessMessageOutside);
  document.body.append(successMessageElement);
};

const onErrorMessageKeydown = (evt) => {
  if (isEscapeKey(evt)) {
    closeErrorMessage();
  }
};

const onClickErrorMessageOutside = (evt) => {
  if (evt.target.parentNode === document.body) {
    closeErrorMessage();
  }
};

function closeErrorMessage () {
  errorMessageElement.remove();
  isShowErrorMessage = false;
  document.body.removeEventListener('click', onClickErrorMessageOutside);
  document.body.removeEventListener('keydown', onErrorMessageKeydown);
}

const showErrorMessage = () => {
  errorMessageButton.addEventListener('click', closeErrorMessage);
  document.body.addEventListener('keydown', onErrorMessageKeydown);
  document.body.addEventListener('click', onClickErrorMessageOutside);
  document.body.append(errorMessageElement);
  isShowErrorMessage = true;
};

const blockSubmitButton = () => {
  submitButton.disabled = true;
  submitButton.textContent = SubmitButtonText.SENDIND;
};

const unblockSubmitButton = () => {
  submitButton.disabled = false;
  submitButton.textContent = SubmitButtonText.IDLE;
};

export const setUploadFormSubmit = (onSuccess) => {
  uploadForm.addEventListener('submit', (evt) => {
    evt.preventDefault();

    const isValid = pristine.validate();
    if (isValid) {
      blockSubmitButton();
      const formData = new FormData(evt.target);

      sendData(formData)
        .then(onSuccess)
        .then(showSuccessMessage)
        .catch(showErrorMessage)
        .finally(unblockSubmitButton);
    }
  });
};

const setBiggerScale = () => {
  if (parseInt(scaleControl.value, 10) < 100) {
    scaleControl.value = `${parseInt(scaleControl.value, 10) + 25}%`;
  }
  imgUploadPreview.style.transform = `scale(${parseInt(scaleControl.value, 10) / 100})`;
};

const setSmallerScale = () => {
  if (parseInt(scaleControl.value, 10) > 25) {
    scaleControl.value = `${parseInt(scaleControl.value, 10) - 25}%`;
  }
  imgUploadPreview.style.transform = `scale(${parseInt(scaleControl.value, 10) / 100})`;
};

export function closeForm () {
  isShowErrorMessage = false;
  uploadOverlay.classList.add('hidden');

  uploadForm.reset();
  pristine.reset();

  imgUploadPreview.style = '';

  hashtagsInput.removeEventListener('keydown', cancelCloseForm);
  commentInput.removeEventListener('keydown', cancelCloseForm);

  scaleControlSmaller.removeEventListener('click', setSmallerScale);
  scaleControlBigger.removeEventListener('click', setBiggerScale);

  effectsList.removeEventListener('change', onChangeEffect);

  if (slider) {
    destroySlider();
  }

  document.body.classList.remove('modal-open');
  document.body.removeEventListener('keydown', onFormKeydown);
}

export function openUploadForm () {
  document.body.addEventListener('keydown', onFormKeydown);
  document.body.classList.add('modal-open');

  uploadOverlay.classList.remove('hidden');

  setPreviewImage();

  closeUploadForm.addEventListener('click', closeForm);
  hashtagsInput.addEventListener('keydown', cancelCloseForm);
  commentInput.addEventListener('keydown', cancelCloseForm);

  scaleControlSmaller.addEventListener('click', setSmallerScale);
  scaleControlBigger.addEventListener('click', setBiggerScale);

  effectsList.addEventListener('change', onChangeEffect);

  slider = initialSlider();
}
