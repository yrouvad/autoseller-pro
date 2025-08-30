class AutoSellerPro {
    constructor() {
        this.currentImage = null;
        this.generatedListings = {};
        this.platformFees = {
            vinted: 0,
            pinterest: 0,
            etsy: 0.065,
            leboncoin: 0,
            ebay: 0.129
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTabs();
        this.setupDragAndDrop();
    }

    setupEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('productImage');
        const removeImageBtn = document.getElementById('removeImage');

        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleImageUpload(e));
        removeImageBtn.addEventListener('click', () => this.removeImage());

        document.getElementById('aliPrice').addEventListener('input', () => this.calculatePrices());
        document.getElementById('marginCoef').addEventListener('change', () => this.calculatePrices());

        document.getElementById('generateBtn').addEventListener('click', () => this.generateListings());
        document.getElementById('publishBtn').addEventListener('click', () => this.publishListings());

        document.getElementById('productName').addEventListener('input', () => this.updatePreview());
        document.getElementById('category').addEventListener('change', () => this.updatePreview());
        document.getElementById('keyPoints').addEventListener('input', () => this.updatePreview());
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                document.querySelectorAll('.preview-card').forEach(card => {
                    card.classList.remove('active');
                });
                document.getElementById(`${tabName}-preview`).classList.add('active');
            });
        });
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.processImage(files[0]);
            }
        });
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.processImage(file);
        }
    }

    processImage(file) {
        if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner une image valide.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentImage = e.target.result;
            this.displayImage();
        };
        reader.readAsDataURL(file);
    }

    displayImage() {
        const uploadArea = document.getElementById('uploadArea');
        const imagePreview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');

        uploadArea.style.display = 'none';
        imagePreview.style.display = 'block';
        previewImg.src = this.currentImage;
    }

    removeImage() {
        this.currentImage = null;
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('imagePreview').style.display = 'none';
        document.getElementById('productImage').value = '';
    }

    calculatePrices() {
        const aliPrice = parseFloat(document.getElementById('aliPrice').value) || 0;
        const marginCoef = parseFloat(document.getElementById('marginCoef').value) || 2.0;

        if (aliPrice <= 0) {
            this.resetPrices();
            return;
        }

        const platforms = ['vinted', 'pinterest', 'etsy', 'leboncoin', 'ebay'];
        
        platforms.forEach(platform => {
            const basePrice = aliPrice * marginCoef;
            const fees = basePrice * this.platformFees[platform];
            const finalPrice = basePrice + fees;
            const psychologicalPrice = this.applyPsychologicalPricing(finalPrice);
            
            document.getElementById(`${platform}Price`).textContent = `${psychologicalPrice.toFixed(2)} €`;
        });
    }

    applyPsychologicalPricing(price) {
        const cents = price % 1;
        const whole = Math.floor(price);
        
        if (cents < 0.5) {
            return whole + 0.99;
        } else {
            return whole + 0.95;
        }
    }

    resetPrices() {
        const platforms = ['vinted', 'pinterest', 'etsy', 'leboncoin', 'ebay'];
        platforms.forEach(platform => {
            document.getElementById(`${platform}Price`).textContent = '--';
        });
    }

    async generateListings() {
        const productName = document.getElementById('productName').value;
        const category = document.getElementById('category').value;
        const keyPoints = document.getElementById('keyPoints').value;
        const aliPrice = parseFloat(document.getElementById('aliPrice').value) || 0;

        if (!this.currentImage || !productName || !category || aliPrice <= 0) {
            alert('Veuillez remplir tous les champs requis et télécharger une image.');
            return;
        }

        this.showLoading(true);

        try {
            await this.simulateGeneration(productName, category, keyPoints, aliPrice);
            this.updatePreview();
            document.getElementById('publishBtn').disabled = false;
        } catch (error) {
            console.error('Erreur lors de la génération:', error);
            alert('Erreur lors de la génération des annonces.');
        } finally {
            this.showLoading(false);
        }
    }

    async simulateGeneration(productName, category, keyPoints, aliPrice) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const marginCoef = parseFloat(document.getElementById('marginCoef').value) || 2.0;
        const basePrice = aliPrice * marginCoef;

        this.generatedListings = {
            vinted: {
                title: this.generateVintedTitle(productName, category),
                description: this.generateVintedDescription(productName, category, keyPoints),
                price: this.applyPsychologicalPricing(basePrice)
            },
            pinterest: {
                title: this.generatePinterestTitle(productName, category),
                description: this.generatePinterestDescription(productName, category, keyPoints)
            },
            etsy: {
                title: this.generateEtsyTitle(productName, category),
                description: this.generateEtsyDescription(productName, category, keyPoints),
                price: this.applyPsychologicalPricing(basePrice + (basePrice * this.platformFees.etsy))
            },
            leboncoin: {
                title: this.generateLeboncoinTitle(productName, category),
                description: this.generateLeboncoinDescription(productName, category, keyPoints),
                price: this.applyPsychologicalPricing(basePrice)
            },
            ebay: {
                title: this.generateEbayTitle(productName, category),
                description: this.generateEbayDescription(productName, category, keyPoints),
                price: this.applyPsychologicalPricing(basePrice + (basePrice * this.platformFees.ebay))
            }
        };
    }

    generateVintedTitle(productName, category) {
        const prefixes = ['Neuf', 'Magnifique', 'Superbe', 'Élégant'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        return `${prefix} ${productName} - ${this.getCategoryName(category)}`;
    }

    generateVintedDescription(productName, category, keyPoints) {
        return `✨ ${productName} en parfait état !

🎯 Description :
${keyPoints}

📏 Taille : Taille unique
🎨 Couleur : Comme sur les photos
📦 État : Neuf avec étiquette

💝 Parfait pour :
- Les amateurs de ${category}
- Un cadeau original
- Un usage quotidien

📬 Envoi rapide et soigné
🤝 Possibilité de remise en main propre

N'hésitez pas à me contacter pour plus d'informations !`;
    }

    generatePinterestTitle(productName, category) {
        return `${productName} - Idée ${category} tendance 2024`;
    }

    generatePinterestDescription(productName, category, keyPoints) {
        return `Découvrez ce magnifique ${productName} ! 

💡 Idée parfaite pour votre collection ${category}

✨ Caractéristiques :
${keyPoints}

💫 Style moderne et tendance
🌿 Matériaux de qualité
📏 Dimensions parfaites

#${category} #tendance2024 #shopping #idée`;
    }

    generateEtsyTitle(productName, category) {
        return `${productName} | ${this.getCategoryName(category)} | Cadeau parfait`;
    }

    generateEtsyDescription(productName, category, keyPoints) {
        return `Bienvenue dans ma boutique !

🎁 ${productName} - Un article unique pour votre collection

📋 Détails du produit :
${keyPoints}

✨ Pourquoi nous choisir ?
- Qualité exceptionnelle
- Service client réactif
- Emballage soigné
- Livraison rapide

🎀 Idéal comme cadeau pour :
- Anniversaire
- Noël
- Fête des mères
- Ou simplement pour se faire plaisir

📦 Informations d'expédition :
- Préparation : 1-2 jours ouvrés
- Livraison : 3-5 jours ouvrés

Des questions ? N'hésitez pas à me contacter !`;
    }

    generateLeboncoinTitle(productName, category) {
        return `${productName} - Neuf`;
    }

    generateLeboncoinDescription(productName, category, keyPoints) {
        return `Vends ${productName} neuf.

${keyPoints}

Prix ferme. Remise en main propre possible.
Premier arrivé, premier servi !`;
    }

    generateEbayTitle(productName, category) {
        return `${productName} NEW ${this.getCategoryName(category)} FAST SHIPPING`;
    }

    generateEbayDescription(productName, category, keyPoints) {
        return `NEW ${productName}

FEATURES:
${keyPoints}

CONDITION: Brand new with tags
SHIPPING: Fast and secure
RETURNS: 30-day return policy

Buy with confidence!`;
    }

    getCategoryName(category) {
        const names = {
            fashion: 'Mode',
            home: 'Maison',
            tech: 'Technologie',
            beauty: 'Beauté',
            toys: 'Jouets'
        };
        return names[category] || 'Produit';
    }

    updatePreview() {
        if (!this.generatedListings.vinted) return;

        Object.keys(this.generatedListings).forEach(platform => {
            const listing = this.generatedListings[platform];
            
            if (listing.title) {
                document.getElementById(`${platform}Title`).textContent = listing.title;
            }
            
            if (listing.description) {
                document.getElementById(`${platform}Desc`).textContent = listing.description;
            }
            
            if (listing.price) {
                document.getElementById(`${platform}PricePreview`).textContent = `${listing.price.toFixed(2)} €`;
            }
        });
    }

    async publishListings() {
        const selectedPlatforms = Array.from(document.querySelectorAll('.platform-item input[type="checkbox"]:checked'))
            .map(cb => cb.value);

        if (selectedPlatforms.length === 0) {
            alert('Veuillez sélectionner au moins une plateforme.');
            return;
        }

        this.showLoading(true);

        try {
            await this.simulatePublishing(selectedPlatforms);
            alert(`✅ Annonces publiées avec succès sur : ${selectedPlatforms.join(', ')}`);
        } catch (error) {
            console.error('Erreur lors de la publication:', error);
            alert('Erreur lors de la publication des annonces.');
        } finally {
            this.showLoading(false);
        }
    }

    async simulatePublishing(platforms) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('Publication simulée sur:', platforms);
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        overlay.style.display = show ? 'flex' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AutoSellerPro();
});
