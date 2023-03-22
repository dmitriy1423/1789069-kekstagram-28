import { isEscapeKey } from './util.js';
import { uploadForm } from './constants.js';

const HASHTAG_REGEXP = /^#[a-zа-яё0-9]{1,19}$/i;

const closeUploadForm = uploadForm.querySelector('.img-upload__cancel');
const uploadOverlay = uploadForm.querySelector('.img-upload__overlay');
export const uploadFile = uploadForm.querySelector('.img-upload__input');

const hashtagsInput = uploadForm.querySelector('.text__hashtags');
const commentInput = uploadForm.querySelector('.text__description');

const scaleControl = uploadForm.querySelector('.scale__control--value');
const scaleControlSmaller = uploadForm.querySelector('.scale__control--smaller');
const scaleControlBigger = uploadForm.querySelector('.scale__control--bigger');

const imgUploadPreview = uploadForm.querySelector('.img-upload__preview img');

const pristine = new Pristine(uploadForm, {
  classTo: 'img-upload__field-wrapper',
  errorTextParent: 'img-upload__field-wrapper'
});

pristine.addValidator(hashtagsInput, validateHashtagsFormat, 'Неверный формат хэш-тегов');
pristine.addValidator(hashtagsInput, validateHashtagsLength, 'Количество хэш-тегов превышает 5');
pristine.addValidator(hashtagsInput, validateHashtagsDuplicate, 'Один и тот же хэш-тег не может быть использован дважды');
pristine.addValidator(commentInput, validateComment, 'Максимальная длина - 140 символов');

const sliderFieldset = uploadForm.querySelector('.img-upload__effect-level');
const sliderElement = uploadForm.querySelector('.effect-level__slider');
const imgEffects = Array.from(uploadForm.querySelectorAll('.effects__radio'));
const imgEffectValue = uploadForm.querySelector('.effect-level__value');

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

const onFormKeydown = (evt) => {
  if (isEscapeKey(evt)) {
    evt.preventDefault();
    closeForm();
  }
};

function cancelCloseForm (evt) {
  evt.target.addEventListener('keydown', (e) => {
    e.stopPropagation();
  });
}

function validateForm (evt) {
  if (!pristine.validate()) {
    evt.preventDefault();
  }
}

function setBiggerScale () {
  if (parseInt(scaleControl.value, 10) < 100) {
    scaleControl.value = `${parseInt(scaleControl.value, 10) + 25}%`;
  }
  imgUploadPreview.style.transform = `scale(${parseInt(scaleControl.value, 10) / 100})`;
}

function setSmallerScale () {
  if (parseInt(scaleControl.value, 10) > 25) {
    scaleControl.value = `${parseInt(scaleControl.value, 10) - 25}%`;
  }
  imgUploadPreview.style.transform = `scale(${parseInt(scaleControl.value, 10) / 100})`;
}

function createEffect (evt) {
  if (evt.target.value === 'none') {
    imgUploadPreview.style.filter = '';
    imgEffectValue.value = '';
    sliderFieldset.classList.add('hidden');
  } else {
    sliderFieldset.classList.remove('hidden');
  }

  switch (evt.target.value) {
    case 'chrome':
      sliderElement.noUiSlider.updateOptions({
        range: {
          min: 0,
          max: 1,
        },
        start: 1,
        step: 0.1
      });
      sliderElement.noUiSlider.on('update', () => {
        imgUploadPreview.style.filter = `grayscale(${sliderElement.noUiSlider.get()})`;
        imgEffectValue.value = sliderElement.noUiSlider.get();
      });
      break;
    case 'sepia':
      sliderElement.noUiSlider.updateOptions({
        range: {
          min: 0,
          max: 1,
        },
        start: 1,
        step: 0.1
      });
      sliderElement.noUiSlider.on('update', () => {
        imgUploadPreview.style.filter = `sepia(${sliderElement.noUiSlider.get()})`;
        imgEffectValue.value = sliderElement.noUiSlider.get();
      });
      break;
    case 'marvin':
      sliderElement.noUiSlider.updateOptions({
        range: {
          min: 1,
          max: 100,
        },
        start: 100,
        step: 1
      });
      sliderElement.noUiSlider.on('update', () => {
        imgUploadPreview.style.filter = `invert(${sliderElement.noUiSlider.get()}%)`;
        imgEffectValue.value = sliderElement.noUiSlider.get();
      });
      break;
    case 'phobos':
      sliderElement.noUiSlider.updateOptions({
        range: {
          min: 0,
          max: 3,
        },
        start: 3,
        step: 0.1
      });
      sliderElement.noUiSlider.on('update', () => {
        imgUploadPreview.style.filter = `blur(${sliderElement.noUiSlider.get()}px)`;
        imgEffectValue.value = sliderElement.noUiSlider.get();
      });
      break;
    case 'heat':
      sliderElement.noUiSlider.updateOptions({
        range: {
          min: 1,
          max: 3,
        },
        start: 3,
        step: 0.1
      });
      sliderElement.noUiSlider.on('update', () => {
        imgUploadPreview.style.filter = `brightness(${sliderElement.noUiSlider.get()})`;
        imgEffectValue.value = sliderElement.noUiSlider.get();
      });
      break;
  }
}

function closeForm () {
  uploadOverlay.classList.add('hidden');

  uploadForm.reset();
  pristine.reset();

  imgUploadPreview.style = '';

  hashtagsInput.removeEventListener('focus', cancelCloseForm);
  commentInput.removeEventListener('focus', cancelCloseForm);

  uploadForm.removeEventListener('submit', validateForm);

  scaleControlSmaller.removeEventListener('click', setSmallerScale);
  scaleControlBigger.removeEventListener('click', setBiggerScale);

  imgEffects.forEach((effect) => {
    effect.removeEventListener('click', createEffect);
  });

  document.body.classList.remove('modal-open');
  document.body.removeEventListener('keydown', onFormKeydown);
}

export function openUploadForm () {
  document.body.addEventListener('keydown', onFormKeydown);
  document.body.classList.add('modal-open');

  uploadOverlay.classList.remove('hidden');

  closeUploadForm.addEventListener('click', closeForm);
  hashtagsInput.addEventListener('focus', cancelCloseForm);
  commentInput.addEventListener('focus', cancelCloseForm);

  uploadForm.addEventListener('submit', validateForm);

  scaleControlSmaller.addEventListener('click', setSmallerScale);
  scaleControlBigger.addEventListener('click', setBiggerScale);

  sliderFieldset.classList.add('hidden');
  imgEffects.forEach((effect) => {
    effect.addEventListener('click', createEffect);
  });
}

function validateHashtagsFormat (hashtags) {
  const hashtagsArray = hashtags.trim().split(' ').filter((hashtag) => hashtag.trim());
  let flag = true;
  hashtagsArray.forEach((hashtag) => {
    if (!HASHTAG_REGEXP.test(hashtag)) {
      flag = false;
    }
  });
  if (hashtagsArray.length === 1 && hashtagsArray[0] === '') {
    flag = true;
  }
  return flag;
}

function validateHashtagsLength (hashtags) {
  const hashtagsArray = hashtags.trim().split(' ').filter((hashtag) => hashtag.trim());
  return hashtagsArray.length <= 5;
}

function validateHashtagsDuplicate (hashtags) {
  const hashtagsArray = hashtags.trim().split(' ').filter((hashtag) => hashtag.trim());
  const set = new Set(hashtagsArray);
  let flag = true;
  if(set.size !== hashtagsArray.length) {
    flag = false;
  }
  return flag;
}

function validateComment (comment) {
  return comment.length <= 140;
}
