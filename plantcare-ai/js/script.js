// script.js - PlantCare AI

document.addEventListener('DOMContentLoaded', () => {

    // FAQ Accordion Logic
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;

            // Close others
            document.querySelectorAll('.accordion-item').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current
            item.classList.toggle('active');
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // adjust for navbar height
                    behavior: 'smooth'
                });
            }
        });
    });

    // Initial setup for the result page progress bar animation
    const progressBar = document.querySelector('.progress-bar-fill');
    if (progressBar) {
        // Reset width to 0 for animation, then apply target inline style value
        const targetWidth = progressBar.style.width;
        progressBar.style.width = '0%';

        setTimeout(() => {
            progressBar.style.width = targetWidth;
        }, 500); // Trigger animation after small delay
    }

    // Simulate interaction for the upload drag & drop UI mapping to standard click handled by HTML label
    const dropZone = document.querySelector('.upload-area');
    if (dropZone) {
        // Just visual effects for drag events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });

        function highlight(e) {
            dropZone.style.borderColor = 'var(--primary)';
            dropZone.style.background = 'var(--primary-light)';
        }

        function unhighlight(e) {
            dropZone.style.borderColor = '#d1d5db';
            dropZone.style.background = 'var(--bg-white)';
        }

        dropZone.addEventListener('drop', handleDrop, false);

        function handleDrop(e) {
            let dt = e.dataTransfer;
            let files = dt.files;

            if (files.length > 0) {
                processFile(files[0]);
            }
        }
    }

    // Handle file input change
    const fileInput = document.getElementById('leaf-upload');
    if (fileInput) {
        fileInput.addEventListener('change', function (e) {
            if (e.target.files.length > 0) {
                processFile(e.target.files[0]);
            }
        });
    }

    function processFile(file) {
        if (!file.type.match('image.*')) {
            alert('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            // Store image in localStorage
            try {
                localStorage.setItem('recentUpload', e.target.result);
                window.location.href = 'result.html';
            } catch (err) {
                console.error("Storage error (file might be too large):", err);
                alert("File is too large to process locally. Please use a smaller image.");
            }
        };
        reader.readAsDataURL(file);
    }

    // --- RESULT PAGE LOGIC ---
    // If we are on the result page, load data and analyze with Gemini
    if (window.location.pathname.includes('result.html')) {
        const recentImage = localStorage.getItem('recentUpload');

        if (recentImage) {
            const scannedImg = document.querySelector('.scanned-image');
            if (scannedImg) {
                scannedImg.src = recentImage;
            }

            // Set loading state
            document.querySelector('.disease-name').textContent = "Analyzing Image...";
            document.querySelector('.plant-type').innerHTML = `Plant Type: <strong>Please wait...</strong>`;
            document.querySelector('.conf-value').textContent = `0%`;
            document.querySelector('.severity-text').textContent = "Contacting Gemini AI...";

            // Convert Base64 back to Blob to send to the server
            fetch(recentImage).then(res => res.blob()).then(blob => {
                const formData = new FormData();
                formData.append('image', blob, 'leaf_image.jpg');

                // Send to Flask backend
                fetch('http://localhost:5001/predict', {
                    method: 'POST',
                    body: formData
                })
                    .then(response => {
                        if (!response.ok) {
                            return response.json().then(err => { throw new Error(err.error || "Server error") });
                        }
                        return response.json();
                    })
                    .then(data => {
                        updateResultDashboard(data);
                    })
                    .catch(error => {
                        console.error('Error fetching diagnosis:', error);
                        document.querySelector('.disease-name').textContent = "Analysis Failed";
                        document.querySelector('.plant-type').innerHTML = `Error: ${error.message}`;
                        document.querySelector('.severity-text').textContent = "Did you run the backend server and set your API key?";
                    });
            });
        }
    }

    function updateResultDashboard(data) {
        // Update basic text
        document.querySelector('.disease-name').textContent = data.condition;
        document.querySelector('.plant-type').innerHTML = `Plant Type: <strong>${data.plant}</strong>`;

        // Update Confidence
        document.querySelector('.conf-value').textContent = `${data.confidence}%`;
        const progressBar = document.querySelector('.progress-bar-fill');
        if (progressBar) progressBar.style.width = `${data.confidence}%`;

        // Update Alert Badge and Icon based on healthy vs diseased
        const badgeAlert = document.querySelector('.badge-alert');
        const diagIcon = document.querySelector('.diagnosis-icon');
        const diagIconInner = diagIcon.querySelector('i');
        const recBox = document.querySelector('.recommendation-box');

        if (!data.detected) {
            // Healthy Styles
            badgeAlert.className = 'badge-alert green-alert';
            badgeAlert.innerHTML = `<i class='bx bxs-check-circle'></i><span>Healthy Plant</span>`;

            document.querySelector('.disease-name').style.color = 'var(--alert-green)';

            diagIcon.className = 'diagnosis-icon green-icon';
            diagIconInner.className = 'bx bx-check';

            recBox.className = 'recommendation-box green-bg mt-4';
        } else {
            // Diseased Styles (default)
            badgeAlert.className = 'badge-alert red-alert';
            badgeAlert.innerHTML = `<i class='bx bxs-error-circle'></i><span>Disease Detected</span>`;

            document.querySelector('.disease-name').style.color = 'var(--alert-red-dark)';

            diagIcon.className = 'diagnosis-icon red-icon';
            diagIconInner.className = 'bx bx-x';

            recBox.className = 'recommendation-box red-bg mt-4';
        }

        // Update Severity Meter
        const meters = document.querySelectorAll('.meter-segment');
        meters.forEach(m => m.classList.remove('active'));
        document.querySelector(`.meter-segment.${data.severity}`).classList.add('active');
        document.querySelector('.severity-text').textContent = data.severityText;

        // Update Recommendations List
        const ul = document.querySelector('.action-list');
        ul.innerHTML = '';
        data.recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.innerHTML = `<i class='bx bx-check'></i> ${rec}`;
            ul.appendChild(li);
        });
    }

});
