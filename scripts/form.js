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
            const savedValue = localStorage.getItem(input.id);
            if (savedValue) {
                input.value = savedValue;
                validateField(input);
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
        
        submitButton.style.visibility = 'visible';
        submitButton.style.display = 'block'; 
        submitButton.style.opacity = allValid ? '1' : '0.5';
        submitButton.style.pointerEvents = allValid ? 'auto' : 'none';
        
        if (allValid) {
            submitButton.classList.add('form__button-active');
        } else {
            submitButton.classList.remove('form__button-active');
        }
    }

    function showError(input, message) {
        const errorElement = input.nextElementSibling || document.createElement('div');
        if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('error-message')) {
            errorElement.className = 'error-message';
            errorElement.style.color = 'rgb(224, 209, 113)';
            errorElement.style.fontSize = '0.8rem';
            errorElement.style.marginTop = '-10px';
            errorElement.style.marginBottom = '5px';
            input.after(errorElement);
        }
        errorElement.textContent = message;
        input.style.border = '1px solid rgb(224, 209, 113)';

        input.classList.remove('valid');
        input.classList.add('invalid');
        form.classList.add('invalid');
    }

    function hideError(input) {
        if (input.nextElementSibling && input.nextElementSibling.classList.contains('error-message')) {
            input.nextElementSibling.remove();
        }
        input.style.border = 'none';
        input.classList.remove('invalid');
        input.classList.add('valid');

        if (Object.values(validationState).every(state => state)) {
            form.classList.remove('invalid');
            form.classList.add('valid');
        }
    }

    function validateName(name, fieldName) {
        const regex = /^[a-zA-Zа-яА-ЯёЁ'\-\s]+$/;

        // Есть люди с короткими именами и фамилиями. Например, Игорь И
        if (name.length < 1) {
            showError(fieldName === 'firstName' ? firstNameInput : lastNameInput, 
                     `Слишком короткое ${fieldName === 'firstName' ? 'имя' : 'фамилия'}. Не менее 1 символа.`);  
            return false;
        }
        
        // Такая длина охватывает практически все существующие имена и фамилии
        if (name.length > 50) {
            showError(fieldName === 'firstName' ? firstNameInput : lastNameInput, 
                     `Слишком длинное ${fieldName === 'firstName' ? 'имя' : 'фамилия'}. Не более 50 символов.`);
            return false;
        }
        
        if (!regex.test(name)) {
            showError(fieldName === 'firstName' ? firstNameInput : lastNameInput, 
                     `Недопустимые символы в ${fieldName === 'firstName' ? 'имени' : 'фамилии'}.`);
            return false;
        }
        
        hideError(fieldName === 'firstName' ? firstNameInput : lastNameInput);
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
        
        const parts = email.split('@');
        if (parts[0].length > 64) {
            showError(emailInput, 'Локальная часть email-адреса слишком длинная (максимум 64 символа).');
            return false;
        }
        
        const domainParts = parts[1].split('.');
        if (domainParts.some(part => part.length > 63)) {
            showError(emailInput, 'Часть домена email-адреса слишком длинная (максимум 63 символа на часть).');
            return false;
        }
        
        const commonTypos = {
            'gmail.com': ['gmial.com', 'gamil.com', 'gmal.com'],
            'yahoo.com': ['yaho.com', 'yahooo.com'],
            'outlook.com': ['outlok.com', 'outook.com'],
            'mail.ru': ['mai.ru', 'maill.ru']
        };
        
        const domain = parts[1].toLowerCase();
        for (const [correctDomain, typos] of Object.entries(commonTypos)) {
            if (typos.includes(domain)) {
                showError(emailInput, `Возможно, вы имели в виду ${parts[0]}@${correctDomain}?`);
                return false;
            }
        }
        
        hideError(emailInput);
        return true;
    }

    function validatePassword(password) {
        let errorMessage = '';
        
        if (password.length < 8) {
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
        
        if (age > 200) {
            showError(birthDayInput, 'Вы не можете быть старше 200 лет.');
            return false;
        }
        
        hideError(birthDayInput);
        return true;
    }

    function validateField(input) {
        if (input === firstNameInput) {
            input.value = capitalizeFirstLetter(input.value);
            validationState.firstName = validateName(input.value, 'firstName');
        } else if (input === lastNameInput) {
            input.value = capitalizeFirstLetter(input.value);
            validationState.lastName = validateName(input.value, 'lastName');
        } else if (input === emailInput) {
            validationState.email = validateEmail(input.value);
        } else if (input === passwordInput) {
            validationState.password = validatePassword(input.value);
            if (passwordConfirmInput.value) {
                validationState.passwordConfirm = validatePasswordConfirm(input.value, passwordConfirmInput.value);
            }
        } else if (input === passwordConfirmInput) {
            validationState.passwordConfirm = validatePasswordConfirm(passwordInput.value, input.value);
        } else if (input === birthDayInput) {
            validationState.birthDay = validateBirthDay(input.value);
        }
        
        checkFormValidity();
    }

    const inputs = [firstNameInput, lastNameInput, emailInput, passwordInput, passwordConfirmInput, birthDayInput];

     inputs.forEach(input => {
        input.addEventListener('input', function() {
            localStorage.setItem(this.id, this.value); 
            validateField(this);
        });

        input.addEventListener('blur', function() {
            localStorage.setItem(this.id, this.value); 
            validateField(this);
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                validateField(this);
                setTimeout(() => {
                    checkFormValidity();
                    submitButton.style.visibility = 'visible';
                }, 10);
            }
        });
    });

    submitButton.addEventListener('focus', function() {
        this.style.visibility = 'visible';
        this.style.opacity = '1';
    });

    submitButton.tabIndex = 0;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (Object.values(validationState).every(state => state)) {
            alert('Форма успешно отправлена!');
            form.reset();
            
            inputs.forEach(input => {
                localStorage.removeItem(input.id);
            });
            
            Object.keys(validationState).forEach(key => {
                validationState[key] = false;
            });
            checkFormValidity();
        }
    });

    window.addEventListener('resize', function() {
        submitButton.style.visibility = 'visible';
        submitButton.style.display = 'block';
    });
    checkFormValidity();
});