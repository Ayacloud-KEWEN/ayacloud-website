
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


(function initParticles() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createParticles();
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function createParticles() {
    particles = [];
    const count = Math.min(140, Math.floor(canvas.width * canvas.height / 85000));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: rand(0, canvas.width),
        y: rand(0, canvas.height),
        r: rand(0.6, 2.8),
        vx: rand(-0.25, 0.25),
        vy: rand(-0.08, 0.22),
        hue: rand(190, 220)
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -50) p.x = canvas.width + 50;
      if (p.x > canvas.width + 50) p.x = -50;
      if (p.y > canvas.height + 50) p.y = -50;

      const grad = ctx.createRadialGradient(p.x, p.y, p.r * 0.1, p.x, p.y, p.r * 6);
      grad.addColorStop(0, `hsla(${p.hue},90%,70%,0.14)`);
      grad.addColorStop(1, `hsla(${p.hue},90%,60%,0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 6, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  draw();
})();


document.addEventListener('DOMContentLoaded', function () {
  initEarth();
  initAnimations();
  initMobileMenu();
  initLanguageSelector();
});

function initEarth() {
  const canvas = document.getElementById('holo-earth');
  if (!canvas) {
    console.error('Earth canvas not found');
    return;
  }

  try {
    const isMobile = window.innerWidth <= 768;
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: !isMobile
    });


    if (isMobile) {
      renderer.setPixelRatio(1);
    } else {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 2.6);


    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(3, 2, 2);
    scene.add(directionalLight);


    const segments = isMobile ? 32 : 64;
    const geometry = new THREE.SphereGeometry(1, segments, segments);


    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.2,
      roughness: 0.7,
      emissive: 0x000000,
      emissiveIntensity: 0
    });

    const earth = new THREE.Mesh(geometry, material);
    scene.add(earth);


    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      'img/earth.jpg',
      (texture) => {
        material.map = texture;
        material.needsUpdate = true;
      },
      undefined,
      (error) => {
        console.log('Earth texture not available, using default material');

        const wireframeGeometry = new THREE.SphereGeometry(1, 32, 32);
        const wireframeMaterial = new THREE.MeshBasicMaterial({
          color: 0x00b7ff,
          wireframe: true,
          opacity: 0.09,
          transparent: true
        });
        const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
        wireframe.scale.set(1.002, 1.002, 1.002);
        scene.add(wireframe);
      }
    );


    const atmosphereMaterial = new THREE.SpriteMaterial({
      color: 0x070b13,
      opacity: 0.08,
      transparent: true
    });
    const atmosphere = new THREE.Sprite(atmosphereMaterial);
    atmosphere.scale.set(4.2, 4.2, 1);
    scene.add(atmosphere);


    addGridLines(scene);


    function handleResize() {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));

      if (canvas.width !== width || canvas.height !== height) {
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;

    let targetRotationY = 0;
    let targetRotationX = 0;
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;

    function onMouseDown(event) {
      isDragging = true;
      previousMouseX = event.clientX;
      previousMouseY = event.clientY;
      canvas.style.cursor = 'grabbing';
    }

    function onMouseMove(event) {
      if (!isDragging) return;

      const deltaX = (event.clientX - previousMouseX) / 200;
      const deltaY = (event.clientY - previousMouseY) / 300;

      targetRotationY += deltaX;
      targetRotationX += deltaY;

      previousMouseX = event.clientX;
      previousMouseY = event.clientY;
    }

    function onMouseUp() {
      isDragging = false;
      canvas.style.cursor = 'grab';
    }


    function onTouchStart(event) {
      event.preventDefault();
      if (event.touches.length === 1) {
        onMouseDown(event.touches[0]);
      }
    }

    function onTouchMove(event) {
      event.preventDefault();
      if (event.touches.length === 1) {
        onMouseMove(event.touches[0]);
      }
    }



    canvas.style.cursor = 'grab';


    const autoRotationSpeed = 0.0022;

    function animate() {
      requestAnimationFrame(animate);

      handleResize();

      controls.update();

      earth.rotation.y += autoRotationSpeed;
      earth.rotation.y += (targetRotationY - earth.rotation.y) * 0.06;
      earth.rotation.x += (targetRotationX - earth.rotation.x) * 0.06;


      earth.rotation.x = Math.max(-0.8, Math.min(0.8, earth.rotation.x));

      renderer.render(scene, camera);
    }

    animate();

  } catch (error) {
    console.error('Error initializing Earth:', error);
  }
}

function addGridLines(scene) {
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x33e1ff,
    transparent: true,
    opacity: 0.2
  });


  for (let lat = -75; lat <= 75; lat += 30) {
    const phi = (lat * Math.PI) / 180;
    const radius = Math.cos(phi);
    const y = Math.sin(phi);
    const points = [];

    for (let lon = 0; lon <= 360; lon += 5) {
      const theta = (lon * Math.PI) / 180;
      points.push(new THREE.Vector3(
        radius * Math.cos(theta),
        y,
        radius * Math.sin(theta)
      ));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    scene.add(new THREE.Line(geometry, lineMaterial));
  }


  for (let lon = 0; lon < 360; lon += 30) {
    const theta = (lon * Math.PI) / 180;
    const points = [];

    for (let lat = -90; lat <= 90; lat += 5) {
      const phi = (lat * Math.PI) / 180;
      const radius = Math.cos(phi);
      points.push(new THREE.Vector3(
        radius * Math.cos(theta),
        Math.sin(phi),
        radius * Math.sin(theta)
      ));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    scene.add(new THREE.Line(geometry, lineMaterial));
  }
}

function initAnimations() {
  anime.timeline({ loop: false })
    .add({
      targets: '.hero-title',
      translateY: [30, 0],
      opacity: [0, 1],
      easing: 'easeOutExpo',
      duration: 800
    })
    .add({
      targets: '.hero-sub',
      translateY: [18, 0],
      opacity: [0, 1],
      easing: 'easeOutExpo',
      duration: 700,
      offset: '-=400'
    });
}

function initMobileMenu() {
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('nav');
  const navOverlay = document.querySelector('.nav-overlay');

  if (mobileToggle && nav && navOverlay) {
    function toggleMenu() {
      nav.classList.toggle('active');
      navOverlay.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (nav.classList.contains('active')) {
        icon.className = 'fas fa-times';
        document.body.style.overflow = 'hidden';
      } else {
        icon.className = 'fas fa-bars';
        document.body.style.overflow = '';
      }
    }

    mobileToggle.addEventListener('click', toggleMenu);

    navOverlay.addEventListener('click', toggleMenu);

    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        navOverlay.classList.remove('active');
        mobileToggle.querySelector('i').className = 'fas fa-bars';
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('active')) {
        toggleMenu();
      }
    });
  }
}

function initLanguageSelector() {
  let currentLang = 'en';
  let translations = {};

  const defaultTranslations = {
    en: {
      home: "Home",
      about: "About",
      services: "Services",
      portfolio: "Portfolio",
      contact: "Contact",
      hero_title: "Designing the Future of Mirrorworlds Apps",
      hero_desc: "We craft elegant, high-performance Mirrorworlds experiences powered by AI and spatial data.",
      hero_cta: "Explore Our Services",
      about_title: "About Us",
      about_text: "AYA CLOUD is a studio focused on AI-driven Mirrorworlds applications and spatial UX. We build tools that help businesses explore the world, visualize data, and create immersive digital twins. Our work blends design, performance engineering and geospatial research to deliver product-ready solutions.",
      services_title: "Our Services",
      service1_title: "App Design",
      service1_text: "Interface & interaction design tailored for spatial products and AR experiences.",
      service2_title: "App Development",
      service2_text: "Cross-platform map engines, mobile & web with performance-first engineering.",
      service3_title: "Consulting",
      service3_text: "Strategy, product discovery and data architecture for geo products.",
      service4_title: "Data Visualization",
      service4_text: "Custom visual layers, analytics dashboards and storytelling with maps.",
      portfolio_title: "Portfolio",
      portfolio_item1: "Exploration & Navigation",
      portfolio_item2: "RoboTech",
      portfolio_item3: "Sports & Tourism",
      portfolio_item4: "Cosmos Explorer",
      portfolio_item5: "Digital Twin",
      portfolio_item6: "Web Map",
      portfolio_item7: "Mirrorworld",
      portfolio_item8: "AstraHuman",
      contact_title: "Contact Us",
      contact_text: "Support Our Work",
      footer: "© 2025 AYA CLOUD SAS. All rights reserved."
    },
    zh: {
      home: "首页",
      about: "关于我们",
      services: "服务",
      portfolio: "项目",
      contact: "联系我们",
      hero_title: "设计AI镜像世界应用的未来",
      hero_desc: "我们为数字世界创建优雅而强大的AI镜像世界应用程序...",
      hero_cta: "探索我们的服务",
      about_title: "关于我们",
      about_text: "AYA CLOUD 是一家专注于人工智能和创新镜像世界应用设计与构建的创意工作室。我们不仅仅想做易于理解、具有审美价值且富有交互性的地图应用，还希望逐步搭建一个开放、创新的地图平台。这个平台将整合来自全球的地理数据、用户贡献内容以及 AI 分析结果，成为一个支持多种场景、多种行业的地图生态系统。通过平台化设计，我们希望能够让个人开发者、企业和组织在同一个系统上协作，共同创造地图价值。无论是旅行打卡、运动记录、智慧城市，还是教育研究、文化传播，此平台都将提供丰富的工具和接口，成为连接现实世界与虚拟世界的核心基础设施之一。",
      services_title: "我们的服务",
      service1_title: "应用设计",
      service1_text: "为地图应用打造直观现代的用户体验...",
      service2_title: "应用开发",
      service2_text: "使用最新技术构建可靠、可扩展和全面拥抱AI的地图应用程序...",
      service3_title: "咨询",
      service3_text: "利用我们的专业知识帮助企业将想法转化为有影响力的数字产品...",
      service4_title: "数据可视化",
      service4_text: "将复杂的地理空间数据转化为清晰的视觉表示...",
      portfolio_title: "项目展示",
      portfolio_item1: "探索与航行",
      portfolio_item2: "机器人技术",
      portfolio_item3: "运动和旅游",
      portfolio_item4: "数字宇宙",
      portfolio_item5: "数字孪生",
      portfolio_item6: "数字地图",
      portfolio_item7: "镜像世界",
      portfolio_item8: "3D人类",
      contact_title: "联系我们",
      contact_text: "请支持我们的项目和想法...",
      footer: "© 2025 AYA CLOUD 保留所有权利。"
    },
    fr: {
      home: "Accueil",
      about: "À propos",
      services: "Services",
      portfolio: "Portfolio",
      contact: "Contact",
      hero_title: "Concevoir l'avenir des mondes miroirs apps IA",
      hero_desc: "Nous créons des applications élégantes et puissantes basées sur des mondes miroirs IA pour le monde numérique...",
      hero_cta: "Explorer nos services",
      about_title: "À propos de nous",
      about_text: "AYA CLOUD est un studio créatif spécialisé dans la conception et la construction d'applications de mondes miroirs innovantes et d'intelligence artificielle (IA). Nous ne voulons pas seulement créer des applications de cartes faciles à comprendre, esthétiques et hautement interactives ; nous espérons également construire progressivement une plateforme de cartes ouverte et innovante. Cette plateforme intégrera des données géographiques mondiales, du contenu fourni par les utilisateurs et des résultats d'analyse par IA pour devenir un écosystème de cartes prenant en charge de multiples scénarios et industries. Grâce à une conception basée sur une plateforme, nous visons à permettre aux développeurs individuels, aux entreprises et aux organisations de collaborer au sein du même système pour créer conjointement de la valeur cartographique. Que ce soit pour l'enregistrement de voyages, le suivi sportif, les villes intelligentes, la recherche pédagogique ou la diffusion culturelle, cette plateforme fournira une multitude d'outils et d'interfaces, devenant ainsi une infrastructure essentielle reliant les mondes réel et virtuel.",
      services_title: "Nos services",
      service1_title: "Conception d'applications",
      service1_text: "Création d'expériences utilisateur intuitives et modernes pour les applications cartographiques...",
      service2_title: "Développement d'applications",
      service2_text: "Construction d'applications cartographiques fiables, évolutives et intégrant pleinement l'IA avec les dernières technologies...",
      service3_title: "Conseil",
      service3_text: "Mettre à profit notre expertise pour aider les entreprises à transformer leurs idées en produits numériques percutants...",
      service4_title: "Visualisation de données",
      service4_text: "Transformer des données géospatiales complexes en représentations visuelles claires...",
      portfolio_title: "Présentation du Portfolio",
      portfolio_item1: "Exploration et Navigation",
      portfolio_item2: "RoboTech",
      portfolio_item3: "Sports et Tourisme",
      portfolio_item4: "Cosmos Explorer",
      portfolio_item5: "Jumeau Numérique",
      portfolio_item6: "Web Map",
      portfolio_item7: "Mirrorworld",
      portfolio_item8: "AstraHuman",
      contact_title: "Contactez-nous",
      contact_text: "Soutenez notre travail et nos idées...",
      footer: "© 2025 AYA CLOUD. Tous droits réservés."
    },
    es: {
      home: "Inicio",
      about: "Sobre nosotros",
      services: "Servicios",
      portfolio: "Portafolio",
      contact: "Contacto",
      hero_title: "Diseñando el futuro de las aplicaciones de mundos espejo con IA",
      hero_desc: "Creamos aplicaciones de mundos espejo elegantes y potentes con IA para el mundo digital...",
      hero_cta: "Explore Nuestros Servicios",
      about_title: "Sobre nosotros",
      about_text: "AYA CLOUD es un estudio creativo enfocado en el diseño y la construcción de aplicaciones de mundos espejo innovadoras y de inteligencia artificial (IA). No solo queremos crear aplicaciones de mapas que sean fáciles de entender, estéticamente agradables y altamente interactivas; también esperamos construir gradualmente una plataforma de mapas abierta e innovadora. Esta plataforma integrará datos geográficos globales, contenido aportado por los usuarios y resultados de análisis de IA para convertirse en un ecosistema de mapas que admita múltiples escenarios e industrias. A través de un diseño basado en una plataforma, nuestro objetivo es permitir que los desarrolladores individuales, las empresas y las organizaciones colaboren dentro del mismo sistema para crear conjuntamente valor cartográfico. Ya sea para registros de viajes, seguimiento deportivo, ciudades inteligentes, investigación educativa o difusión cultural, esta plataforma proporcionará una gran cantidad de herramientas e interfaces, convirtiéndose en una infraestructura central que conecta los mundos real y virtual.",
      services_title: "Nuestros Servicios",
      service1_title: "Diseño de Apps",
      service1_text: "Creando experiencias de usuario intuitivas y modernas para aplicaciones de mapas...",
      service2_title: "Desarrollo de Apps",
      service2_text: "Construyendo aplicaciones de mapas fiables, escalables y que adoptan plenamente la IA utilizando las últimas tecnologías...",
      service3_title: "Consultoría",
      service3_text: "Aprovechando nuestra experiencia para ayudar a las empresas a transformar ideas en productos digitales impactantes...",
      service4_title: "Visualización de Datos",
      service4_text: "Transformando datos geoespaciales complejos en visualizaciones claras...",
      portfolio_title: "Muestra de Portafolio",
      portfolio_item1: "Exploración y Navegación",
      portfolio_item2: "Robotech",
      portfolio_item3: "Deportes y Turismo",
      portfolio_item4: "Explorador del cosmos",
      portfolio_item5: "Gemelo Digital",
      portfolio_item6: "Web Map",
      portfolio_item7: "Mirrorworld",
      portfolio_item8: "AstraHuman",
      contact_title: "Contáctenos",
      contact_text: "Nos encantaría saber de usted y discutir sus ideas de proyecto...",
      footer: "© 2025 AYA CLOUD. Todos los derechos reservados."
    },
    de: {
      home: "Startseite",
      about: "Über uns",
      services: "Dienstleistungen",
      portfolio: "Portfolio",
      contact: "Kontakt",
      hero_title: "Die Zukunft der KI-Spiegelwelten-Apps gestalten",
      hero_desc: "Wir erstellen elegante und leistungsstarke KI-basierte Spiegelwelten für die digitale Welt...",
      hero_cta: "Entdecken Sie unsere Dienstleistungen",
      about_title: "Über uns",
      about_text: "AYA CLOUD ist ein Kreativstudio, das sich auf das Design und die Erstellung von Anwendungen für künstliche Intelligenz (KI) und innovative Spiegelwelten spezialisiert hat. Wir wollen nicht nur Kartenanwendungen erstellen, die leicht verständlich, ästhetisch ansprechend und hochgradig interaktiv sind, sondern wir hoffen auch, schrittweise eine offene und innovative Kartenplattform aufzubauen. Diese Plattform wird globale geografische Daten, von Nutzern beigetragene Inhalte und KI-Analyseergebnisse integrieren, um ein Karten-Ökosystem zu schaffen, das verschiedene Szenarien und Branchen unterstützt. Durch ein plattformbasiertes Design möchten wir es einzelnen Entwicklern, Unternehmen und Organisationen ermöglichen, im selben System zusammenzuarbeiten, um gemeinsam Kartenwerte zu schaffen. Ob für Reise-Check-ins, Sport-Tracking, Smart Cities, Bildungsforschung oder Kulturverbreitung, diese Plattform wird eine Fülle von Werkzeugen und Schnittstellen bereitstellen und zu einer zentralen Infrastruktur werden, die die reale und die virtuelle Welt verbindet.",
      services_title: "Unsere Dienstleistungen",
      service1_title: "App-Design",
      service1_text: "Gestaltung intuitiver und moderner Benutzererlebnisse für Kartenanwendungen...",
      service2_title: "App-Entwicklung",
      service2_text: "Erstellung zuverlässiger, skalierbarer und vollständig KI-fähiger Kartenanwendungen unter Verwendung der neuesten Technologien...",
      service3_title: "Beratung",
      service3_text: "Wir nutzen unsere Expertise, um Unternehmen dabei zu helfen, Ideen in wirkungsvolle digitale Produkte umzusetzen...",
      service4_title: "Datenvisualisierung",
      service4_text: "Umwandlung komplexer Geodaten in klare visuelle Darstellungen...",
      portfolio_title: "Portfolio-Präsentation",
      portfolio_item1: "Erkundung und Navigation",
      portfolio_item2: "Robotech",
      portfolio_item3: "Sport und Tourismus",
      portfolio_item4: "Kosmos-Explorer",
      portfolio_item5: "Digitaler Zwilling",
      portfolio_item6: "Web Map",
      portfolio_item7: "Mirrorworld",
      portfolio_item8: "AstraHuman",
      contact_title: "Kontaktieren Sie uns",
      contact_text: "Unterstützen Sie unsere Arbeit und Ideen...",
      footer: "© 2025 AYA CLOUD. Alle Rechte vorbehalten."
    }
  };

  function loadTranslations(lang) {
    try {
      translations = defaultTranslations[lang] || defaultTranslations['en'];
      applyTranslations();
    } catch (error) {
      console.error('Error loading translations:', error);
      translations = defaultTranslations['en'];
      applyTranslations();
    }
  }

  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (translations[key]) {
        element.textContent = translations[key];
      }
    });

    document.getElementById('current-lang').textContent = getLangCode(currentLang);

    document.querySelectorAll('.lang-option').forEach(option => {
      if (option.getAttribute('data-lang') === currentLang) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  }

  function getLangCode(lang) {
    const codes = {
      en: 'EN',
      zh: '中文',
      fr: 'FR',
      es: 'ES',
      de: 'DE'
    };
    return codes[lang] || 'EN';
  }

  function switchLanguage(lang) {
    currentLang = lang;
    loadTranslations(lang);
    localStorage.setItem('preferredLanguage', lang);
  }

  document.querySelectorAll('.lang-option').forEach(option => {
    option.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = option.getAttribute('data-lang');
      switchLanguage(lang);

      if (window.innerWidth <= 768) {
        document.querySelector('.language-selector').classList.remove('active');
      }
    });
  });

  if (window.innerWidth <= 768) {
    document.querySelector('.language-selector').addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelector('.language-selector').classList.toggle('active');
    });

    document.addEventListener('click', () => {
      document.querySelector('.language-selector').classList.remove('active');
    });
  }

  const savedLang = localStorage.getItem('preferredLanguage') || 'en';
  switchLanguage(savedLang);
}
