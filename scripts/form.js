document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.form');
    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordConfirmInput = document.getElementById('password-confirm');
    const birthDayInput = document.getElementById('birth-day');
    const submitButton = document.getElementById('form-button');

    const validationState = {
        firstName: false,
        lastName: false,
        email: false,
        password: false,
        passwordConfirm: false,
        birthDay: false
    };

    function restoreValues() {
        const inputs = [firstNameInput, lastNameInput, emailInput, passwordInput, passwordConfirmInput, birthDayInput];
        inputs.forEach(input => {
            const savedValue = sessionStorage.getItem(input.id);
            if (savedValue) {
                input.value = savedValue;
                validateField(input, true);
            }
        });
    }

    restoreValues();

    function capitalizeFirstLetter(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function checkFormValidity() {
        const allValid = Object.values(validationState).every(state => state);
        submitButton.disabled = !allValid;
        
        if (allValid) {
            form.classList.add('valid');
            form.classList.remove('invalid');
            submitButton.classList.add('valid', 'form__button-active');
            submitButton.classList.remove('invalid');
        } else {
            form.classList.add('invalid');
            form.classList.remove('valid');
            submitButton.classList.add('invalid');
            submitButton.classList.remove('valid', 'form__button-active');
        }
    }

    function showError(input, message) {
        let errorElement = input.nextElementSibling;
        
        if (!errorElement || !errorElement.classList.contains('error-message')) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.style.color = 'rgb(224, 209, 113)';
            errorElement.style.fontSize = '0.8rem';
            errorElement.style.marginTop = '-10px';
            errorElement.style.marginBottom = '5px';
            input.insertAdjacentElement('afterend', errorElement);
        }
        
        errorElement.textContent = message;
        input.classList.remove('valid');
        input.classList.add('invalid');
    }

    function hideError(input) {
        const errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.remove();
        }
        input.classList.remove('invalid');
        if (input.value.trim()) {
            input.classList.add('valid');
        } else {
            input.classList.remove('valid');
        }
    }

    function validateName(name, fieldName) {
        const regex = /^[a-zA-Zа-яА-ЯёЁ'\-\s]+$/;
        const input = fieldName === 'firstName' ? firstNameInput : lastNameInput;
        const fieldDisplayName = fieldName === 'firstName' ? 'имя' : 'фамилия';
        name = name.trim();

        if (!name) {
            showError(input, `Поле "${fieldDisplayName}" обязательно для заполнения.`);
            return false;
        }
        
        if (name.length < 1) {
            showError(input, `Слишком короткое ${fieldDisplayName}. Не менее 1 символа.`);  
            return false;
        }
        
        if (name.length > 50) {
            showError(input, `Слишком длинное ${fieldDisplayName}. Не более 50 символов.`);
            return false;
        }
        
        if (!regex.test(name)) {
            showError(input, `Недопустимые символы в ${fieldDisplayName}.`);
            return false;
        }
        
        hideError(input);
        return true;
    }

    function validateEmail(email) {
        email = email.trim();
        const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
        
        if (!email) {
            showError(emailInput, 'Поле "Электронный адрес" обязательно для заполнения.');
            return false;
        }
        
        if (email.length > 254) {
            showError(emailInput, 'Email-адрес слишком длинный (максимум 254 символа).');
            return false;
        }
        
        if (!regex.test(email)) {
            showError(emailInput, 'Введите корректный email-адрес (например: example@domain.com).');
            return false;
        }
        
        hideError(emailInput);
        return true;
    }

    function validatePassword(password) {
        password = password.trim();
        let errorMessage = '';
        
        if (!password) {
            errorMessage = 'Поле "Пароль" обязательно для заполнения.';
        } else if (password.length < 8) {
            errorMessage = 'Пароль должен содержать минимум 8 символов.';
        } else if (!/\d/.test(password)) {
            errorMessage = 'Пароль должен содержать хотя бы одну цифру.';
        } else if (!/[A-ZА-ЯЁ]/.test(password)) {
            errorMessage = 'Пароль должен содержать хотя бы одну заглавную букву.';
        } else if (!/[a-zа-яё]/.test(password)) {
            errorMessage = 'Пароль должен содержать хотя бы одну строчную букву.';
        } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errorMessage = 'Пароль должен содержать хотя бы один специальный символ.';
        }
        
        if (errorMessage) {
            showError(passwordInput, errorMessage);
            return false;
        }
        
        hideError(passwordInput);
        return true;
    }

    function validatePasswordConfirm(password, passwordConfirm) {
        passwordConfirm = passwordConfirm.trim();
        
        if (!passwordConfirm) {
            showError(passwordConfirmInput, 'Пожалуйста, подтвердите пароль.');
            return false;
        }
        
        if (password !== passwordConfirm) {
            showError(passwordConfirmInput, 'Пароли не совпадают.');
            return false;
        }
        
        hideError(passwordConfirmInput);
        return true;
    }

    function validateBirthDay(date) {
        if (!date) {
            showError(birthDayInput, 'Пожалуйста, укажите дату рождения.');
            return false;
        }
        
        const birthDate = new Date(date);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        if (age < 18) {
            showError(birthDayInput, 'Вы должны быть старше 18 лет.');
            return false;
        }
        
        hideError(birthDayInput);
        return true;
    }

    function validateField(input, initialLoad = false) {
        if (input === firstNameInput) {
            input.value = capitalizeFirstLetter(input.value.trim());
            validationState.firstName = validateName(input.value, 'firstName');
        } else if (input === lastNameInput) {
            input.value = capitalizeFirstLetter(input.value.trim());
            validationState.lastName = validateName(input.value, 'lastName');
        } else if (input === emailInput) {
            validationState.email = validateEmail(input.value);
        } else if (input === passwordInput) {
            const passwordValid = validatePassword(input.value);
            validationState.password = passwordValid;
            if (passwordValid || !initialLoad) {
                validationState.passwordConfirm = validatePasswordConfirm(input.value, passwordConfirmInput.value);
            }
        } else if (input === passwordConfirmInput) {
            validationState.passwordConfirm = validatePasswordConfirm(passwordInput.value, input.value);
        } else if (input === birthDayInput) {
            validationState.birthDay = validateBirthDay(input.value);
        }
        
        sessionStorage.setItem(input.id, input.value);
        checkFormValidity();
    }

    const inputs = [firstNameInput, lastNameInput, emailInput, passwordInput, passwordConfirmInput, birthDayInput];

    inputs.forEach(input => {
        input.addEventListener('input', function() {
            validateField(this);
        });

        input.addEventListener('blur', function() {
            validateField(this);
        });
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        inputs.forEach(input => validateField(input));
        
        if (Object.values(validationState).every(state => state)) {
            alert('Форма успешно отправлена!');
            form.reset();
            
            inputs.forEach(input => {
                sessionStorage.removeItem(input.id);
                input.classList.remove('valid');
                input.classList.remove('invalid');
                const errorElement = input.nextElementSibling;
                if (errorElement && errorElement.classList.contains('error-message')) {
                    errorElement.remove();
                }
            });
            
            Object.keys(validationState).forEach(key => {
                validationState[key] = false;
            });
            
            checkFormValidity();
        }
    });

    inputs.forEach(input => {
        if (input.value) validateField(input, true);
    });
    checkFormValidity();
});