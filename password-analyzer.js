document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const passwordInput = document.getElementById('password');
    const toggleButton = document.getElementById('toggle-password');
    const eyeIcon = document.getElementById('eye-icon');
    const strengthNumber = document.getElementById('strength-number');
    const vizIcon = document.getElementById('viz-icon');
    const meterSegments = document.querySelectorAll('.meter-segment');
    const recommendationsText = document.getElementById('recommendations-text');
    
    // Criteria elements
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

    // Common passwords list (just a sample - in a real app, this should be more extensive)
    const commonPasswords = [
        'password', '123456', 'qwerty', 'admin', 'welcome', 
        'password123', 'abc123', 'letmein', '123456789', '12345678',
        'football', 'iloveyou', 'admin123', 'baseball', 'monkey'
    ];

    // Sequential patterns to check
    const sequentialPatterns = [
        'abcdefghijklmnopqrstuvwxyz',
        'zyxwvutsrqponmlkjihgfedcba',
        '0123456789',
        '9876543210'
    ];

    // Toggle password visibility
    toggleButton.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle eye icon
        if (type === 'password') {
            eyeIcon.classList.remove('fa-eye-slash');
            eyeIcon.classList.add('fa-eye');
        } else {
            eyeIcon.classList.remove('fa-eye');
            eyeIcon.classList.add('fa-eye-slash');
        }
    });

    // Analyze password on input
    passwordInput.addEventListener('input', analyzePassword);

    function analyzePassword() {
        const password = passwordInput.value;
        
        // Reset all indicators
        resetIndicators();
        
        if (!password) {
            updateStrengthMeter(0);
            recommendationsText.textContent = '_ AWAITING INPUT...';
            return;
        }
        
        // Check basic criteria
        const criteriaResults = checkBasicCriteria(password);
        
        // Check for patterns
        const patternResults = checkPatterns(password);
        
        // Calculate overall strength (0-100)
        const strength = calculateOverallStrength(criteriaResults, patternResults);
        
        // Update the UI
        updateStrengthMeter(strength);
        
        // Generate recommendations
        generateRecommendations(password, criteriaResults, patternResults);
    }

    function resetIndicators() {
        // Reset all criteria indicators
        for (const key in criteriaElements) {
            const element = criteriaElements[key];
            const icon = element.querySelector('i');
            icon.className = 'fa-solid fa-circle-xmark';
        }
        
        // Reset meter segments
        meterSegments.forEach(segment => {
            const fillDiv = segment.querySelector('div');
            if (fillDiv) {
                fillDiv.style.height = '0%';
            }
        });
        
        // Reset strength number
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
        
        // Update criteria indicators
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
        
        // Check if it's a common password
        const isCommon = commonPasswords.includes(lowercasePassword);
        
        // Check for repeated characters (3 or more of the same character in a row)
        const hasRepeatedChars = /(.)\1{2,}/.test(password);
        
        // Check for sequential characters
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
        
        // Simple check for potential personal info patterns (simplified for demo)
        const hasPersonalInfo = /19\d{2}|20\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|admin|user|pass|pwd/i.test(password);
        
        const results = {
            commonPassword: !isCommon,
            repeatedChars: !hasRepeatedChars,
            sequentialChars: !hasSequentialChars,
            personalInfo: !hasPersonalInfo
        };
        
        // Update criteria indicators
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
        // Basic criteria contribute 50% of the score
        const criteriaWeight = 0.5;
        const criteriaScore = Object.values(criteriaResults).filter(Boolean).length / Object.values(criteriaResults).length;
        
        // Pattern checks contribute 50% of the score
        const patternWeight = 0.5;
        const patternScore = Object.values(patternResults).filter(Boolean).length / Object.values(patternResults).length;
        
        // Calculate weighted score (0-100)
        return Math.round((criteriaScore * criteriaWeight + patternScore * patternWeight) * 100);
    }

    function updateStrengthMeter(strength) {
        // Update the strength number in the display
        strengthNumber.textContent = strength;
        
        // Change the icon based on strength
        updateDisplayIcon(strength);
        
        // Update the meter segments
        updateMeterSegments(strength);
    }
    
    function updateDisplayIcon(strength) {
        // Reset icon classes
        vizIcon.className = 'fa-solid cow-icon';
        
        // Add appropriate icon based on strength
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
        // Fill the appropriate number of segments
        meterSegments.forEach(segment => {
            const segmentValue = parseInt(segment.getAttribute('data-value'));
            const fillHeight = strength >= segmentValue ? '100%' : '0%';
            
            // Get the fill div we created and update its height
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
        
        // Recommend based on failed basic criteria
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
        
        // Recommend based on failed pattern checks
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
        
        // General advice
        if (recommendations.length === 0) {
            recommendationsText.textContent = '> ANALYSIS COMPLETE\n> PASSWORD STRENGTH: EXCELLENT\n> USE UNIQUE PASSWORDS FOR DIFFERENT SERVICES';
        } else {
            recommendationsText.textContent = recommendations.join('\n');
        }
    }
    
    // Initialize the meter segments to properly show filling
    meterSegments.forEach(segment => {
        // Apply the after pseudo-element height via JavaScript
        // This is a workaround since we can't directly manipulate pseudo-elements with JS
        segment.style.position = 'relative';
        
        const fill = document.createElement('div');
        fill.style.position = 'absolute';
        fill.style.left = '0';
        fill.style.bottom = '0';
        fill.style.width = '100%';
        fill.style.height = '0%';
        
        // Set the correct color based on which segment this is
        if (parseInt(segment.getAttribute('data-value')) <= 30) {
            fill.style.backgroundColor = '#ff0000'; // Red for first 3 segments
        } else if (parseInt(segment.getAttribute('data-value')) <= 60) {
            fill.style.backgroundColor = '#ffcc00'; // Yellow for middle segments
        } else {
            fill.style.backgroundColor = '#00c800'; // Green for last segments
        }
        
        fill.style.borderRadius = '4px';
        fill.style.transition = 'height 0.2s ease-out';
        
        segment.appendChild(fill);
    });
});