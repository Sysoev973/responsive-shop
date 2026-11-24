// Логика модального окна быстрой заявки и доступная валидация форм.
// Сообщения об ошибках выводятся в элементы с role="alert", связанные с полями
// через aria-describedby; состояние поля отмечается aria-invalid.
const successMessage = document.getElementById('success-message');

// Показать/скрыть ошибку поля
const setFieldError = (field, hasError) => {
  const error = field.id ? document.getElementById(field.id + '-error') : null;
  if (hasError) {
    field.setAttribute('aria-invalid', 'true');
  } else {
    field.removeAttribute('aria-invalid');
  }
  if (error) error.hidden = !hasError;
};

// Проверить форму: подсветить ошибки и вернуть фокус на первое невалидное поле
const validateForm = (form) => {
  let firstInvalid = null;
  Array.from(form.elements).forEach((field) => {
    if (!field.willValidate) return;
    const invalid = !field.checkValidity();
    setFieldError(field, invalid);
    if (invalid && !firstInvalid) firstInvalid = field;
  });
  if (firstInvalid) firstInvalid.focus();
  return !firstInvalid;
};

// Убирать ошибку по мере исправления поля
const watchFields = (form) => {
  Array.from(form.elements).forEach((field) => {
    if (!field.willValidate) return;
    const eventName = (field.tagName === 'SELECT' || field.type === 'checkbox') ? 'change' : 'input';
    field.addEventListener(eventName, () => setFieldError(field, !field.checkValidity()));
  });
};

const showSuccess = (form) => {
  form.reset();
  if (!successMessage) return;
  successMessage.hidden = false;
  setTimeout(() => { successMessage.hidden = true; }, 5000);
};

const orderDialog = document.getElementById('order-dialog');

if (orderDialog) {
  const orderForm = document.getElementById('order-form');
  const selectedInput = document.getElementById('selected-product');
  const selectedLabel = document.getElementById('selected-product-label');

  document.querySelectorAll('[data-product]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedInput.value = button.dataset.product;
      selectedLabel.textContent = 'Выбран сборник: ' + button.dataset.product;
      selectedLabel.hidden = false;
      orderDialog.showModal();
    });
  });

  document.getElementById('close-order-dialog').addEventListener('click', () => orderDialog.close());

  // Закрытие по клику на затемнённый фон
  orderDialog.addEventListener('click', (event) => {
    if (event.target === orderDialog) orderDialog.close();
  });

  orderDialog.addEventListener('close', () => {
    Array.from(orderForm.elements).forEach((field) => setFieldError(field, false));
    orderForm.reset();
    selectedLabel.hidden = true;
  });

  watchFields(orderForm);

  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateForm(orderForm)) return;
    orderDialog.close();
    showSuccess(orderForm);
  });
}

// Страничные формы (order.html, contacts.html)
document.querySelectorAll('form.order-form--page').forEach((form) => {
  watchFields(form);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateForm(form)) return;
    showSuccess(form);
  });
});
