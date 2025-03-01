document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password');
    const toggleButton = document.getElementById('toggle-password');
    const eyeIcon = document.getElementById('eye-icon');
    const strengthNumber = document.getElementById('strength-number');
    const vizIcon = document.getElementById('viz-icon');
    const meterSegments = document.querySelectorAll('.meter-segment');
    const recommendationsText = document.getElementById('recommendations-text');
    
    const criteriaElements = {
        length: document.getElementById('length'),
        uppercase: document.getElementById('uppercase'),
        lowercase: document.getElementById('lowercase'),
        number: document.getElementById('number'),
        special: document.getElementById('special'),
        commonPassword: document.getElementById('common-password'),
        repeatedChars: document.getElementById('repeated-chars'),
        sequentialChars: document.getElementById('sequential-chars'),
        personalInfo: document.getElementById('personal-info')
    };

    const commonPasswords = [
        'password', '123456', 'qwerty', 'admin', 'welcome', 
        'password123', 'abc123', 'letmein', '123456789', '12345678',
        'football', 'iloveyou', 'admin123', 'baseball', 'monkey'
    ];

    const sequentialPatterns = [
        'abcdefghijklmnopqrstuvwxyz',
        'zyxwvutsrqponmlkjihgfedcba',
        '0123456789',
        '9876543210'
    ];

    toggleButton.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        if (type === 'password') {
            eyeIcon.classList.remove('fa-eye-slash');
            eyeIcon.classList.add('fa-eye');
        } else {
            eyeIcon.classList.remove('fa-eye');
            eyeIcon.classList.add('fa-eye-slash');
        }
    });

    passwordInput.addEventListener('input', analyzePassword);

    function analyzePassword() {
        const password = passwordInput.value;
        
        resetIndicators();
        
        if (!password) {
            updateStrengthMeter(0);
            recommendationsText.textContent = '_ AWAITING INPUT...';
            return;
        }
        
        const criteriaResults = checkBasicCriteria(password);
        const patternResults = checkPatterns(password);
        const strength = calculateOverallStrength(criteriaResults, patternResults);
        updateStrengthMeter(strength);
        generateRecommendations(password, criteriaResults, patternResults);
    }

    function resetIndicators() {
        for (const key in criteriaElements) {
            const element = criteriaElements[key];
            const icon = element.querySelector('i');
            icon.className = 'fa-solid fa-circle-xmark';
        }
        
        meterSegments.forEach(segment => {
            const fillDiv = segment.querySelector('div');
            if (fillDiv) {
                fillDiv.style.height = '0%';
            }
        });
        
        strengthNumber.textContent = '0';
    }

    function checkBasicCriteria(password) {
        const results = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password)
        };
        
        for (const key in results) {
            const element = criteriaElements[key];
            const icon = element.querySelector('i');
            
            if (results[key]) {
                icon.className = 'fa-solid fa-circle-check';
            } else {
                icon.className = 'fa-solid fa-circle-xmark';
            }
        }
        
        return results;
    }

    function checkPatterns(password) {
        const lowercasePassword = password.toLowerCase();
        const isCommon = commonPasswords.includes(lowercasePassword);
        const hasRepeatedChars = /(.)\1{2,}/.test(password);
        
        let hasSequentialChars = false;
        for (const pattern of sequentialPatterns) {
            for (let i = 0; i < pattern.length - 2; i++) {
                const sequence = pattern.substring(i, i + 3);
                if (lowercasePassword.includes(sequence)) {
                    hasSequentialChars = true;
                    break;
                }
            }
            if (hasSequentialChars) break;
        }
        
        const hasPersonalInfo = /19\d{2}|20\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|admin|user|pass|pwd/i.test(password);
        
        const results = {
            commonPassword: !isCommon,
            repeatedChars: !hasRepeatedChars,
            sequentialChars: !hasSequentialChars,
            personalInfo: !hasPersonalInfo
        };
        
        for (const key in results) {
            const element = criteriaElements[key];
            const icon = element.querySelector('i');
            
            if (results[key]) {
                icon.className = 'fa-solid fa-circle-check';
            } else {
                icon.className = 'fa-solid fa-circle-xmark';
            }
        }
        
        return results;
    }

    function calculateOverallStrength(criteriaResults, patternResults) {
        const criteriaWeight = 0.5;
        const criteriaScore = Object.values(criteriaResults).filter(Boolean).length / Object.values(criteriaResults).length;
        const patternWeight = 0.5;
        const patternScore = Object.values(patternResults).filter(Boolean).length / Object.values(patternResults).length;
        return Math.round((criteriaScore * criteriaWeight + patternScore * patternWeight) * 100);
    }

    function updateStrengthMeter(strength) {
        strengthNumber.textContent = strength;
        updateDisplayIcon(strength);
        updateMeterSegments(strength);
    }
    
    function updateDisplayIcon(strength) {
        vizIcon.className = 'fa-solid cow-icon';
        
        if (strength < 40) {
            vizIcon.classList.add('fa-shield-halved');
            vizIcon.style.color = '#ff0000';
        } else if (strength < 70) {
            vizIcon.classList.add('fa-shield');
            vizIcon.style.color = '#ffcc00';
        } else {
            vizIcon.classList.add('fa-shield-heart');
            vizIcon.style.color = '#00cc00';
        }
    }
    
    function updateMeterSegments(strength) {
        meterSegments.forEach(segment => {
            const segmentValue = parseInt(segment.getAttribute('data-value'));
            const fillHeight = strength >= segmentValue ? '100%' : '0%';
            const fillDiv = segment.querySelector('div');
            if (fillDiv) {
                fillDiv.style.height = fillHeight;
            }
        });
    }

    function generateRecommendations(password, criteriaResults, patternResults) {
        if (!password) {
            recommendationsText.textContent = '_ AWAITING INPUT...';
            return;
        }
        
        const recommendations = [];
        
        if (!criteriaResults.length) {
            recommendations.push('> MIN LENGTH: INCREASE TO 8+ CHARS');
        }
        
        if (!criteriaResults.uppercase) {
            recommendations.push('> UPPERCASE: ADD [A-Z]');
        }
        
        if (!criteriaResults.lowercase) {
            recommendations.push('> LOWERCASE: ADD [a-z]');
        }
        
        if (!criteriaResults.number) {
            recommendations.push('> NUMERIC: ADD [0-9]');
        }
        
        if (!criteriaResults.special) {
            recommendations.push('> SPECIAL: ADD [!@#$%^&*]');
        }
        
        if (!patternResults.commonPassword) {
            recommendations.push('> COMMON PASSWORD DETECTED');
            recommendations.push('  USE UNIQUE COMBINATION');
        }
        
        if (!patternResults.repeatedChars) {
            recommendations.push('> REPETITION DETECTED');
            recommendations.push('  AVOID PATTERNS LIKE "aaa"');
        }
        
        if (!patternResults.sequentialChars) {
            recommendations.push('> SEQUENCE DETECTED');
            recommendations.push('  AVOID PATTERNS LIKE "123"');
        }
        
        if (!patternResults.personalInfo) {
            recommendations.push('> PERSONAL INFO DETECTED');
            recommendations.push('  AVOID NAMES/DATES/COMMON WORDS');
        }
        
        if (recommendations.length === 0) {
            recommendationsText.textContent = '> ANALYSIS COMPLETE\n> PASSWORD STRENGTH: EXCELLENT\n> USE UNIQUE PASSWORDS FOR DIFFERENT SERVICES';
        } else {
            recommendationsText.textContent = recommendations.join('\n');
        }
    }
    
    meterSegments.forEach(segment => {
        segment.style.position = 'relative';
        
        const fill = document.createElement('div');
        fill.style.position = 'absolute';
        fill.style.left = '0';
        fill.style.bottom = '0';
        fill.style.width = '100%';
        fill.style.height = '0%';
        
        if (parseInt(segment.getAttribute('data-value')) <= 30) {
            fill.style.backgroundColor = '#ff0000';
        } else if (parseInt(segment.getAttribute('data-value')) <= 60) {
            fill.style.backgroundColor = '#ffcc00';
        } else {
            fill.style.backgroundColor = '#00c800';
        }
        
        fill.style.borderRadius = '4px';
        fill.style.transition = 'height 0.2s ease-out';
        
        segment.appendChild(fill);
    });
});