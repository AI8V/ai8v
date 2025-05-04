// وضع جميع النصوص البرمجية داخل استدعاء DOMContentLoaded للتأكد من تحميل الصفحة أولاً
document.addEventListener('DOMContentLoaded', function() {

  // ScriptGoogle.js - إرسال بيانات النموذج
  const quoteButton = document.querySelector(".modal-footer button.btn-info");
  if (quoteButton) {
    quoteButton.addEventListener("click", function() {
      const form = document.getElementById("quoteForm");
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const data = {
        productName: document.getElementById("productName").value,
        quantity: document.getElementById("quantity").value,
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        notes: document.getElementById("notes").value
      };

      // إرسال بيانات الاقتباس إلى Google Script
      fetch("https://script.google.com/macros/s/AKfycbzKdCIce5CpZLv2N5DUiyhrpE3X8EAVhcSzBakTuDOP5yC8lKTSSLuLI8RdGOYyP_H-/exec", {
        method: "POST",
        body: JSON.stringify(data)
      });
    });
  }

  // WhyUs.js - تأثيرات العداد والرسوم المتحركة
  const counterElements = document.querySelectorAll(".counter");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const countTo = parseInt(target.innerText);
        let count = 0;
        const interval = setInterval(() => {
          target.innerText = count;
          if (count >= countTo) {
            clearInterval(interval);
          }
          count = Math.ceil(count + countTo / 20);
        }, 50);
        observer.unobserve(target);
      }
    });
  }, { threshold: 0.5 });

  counterElements.forEach(el => {
    observer.observe(el);
  });

  const cards = document.querySelectorAll(".hover-effect");
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }, index * 100);
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.style.transition = "all 0.5s ease";
    cardObserver.observe(card);
  });

  // quoteModal.js - التعامل مع نافذة الاقتباس المنبثقة
  const quoteModal = document.getElementById("quoteModal");
  if (quoteModal) {
    quoteModal.addEventListener("show.bs.modal", function(event) {
      const button = event.relatedTarget;
      const productCard = button.closest(".card");
      let productTitle = "";

      if (productCard && productCard.querySelector(".card-title")) {
        productTitle = productCard.querySelector(".card-title").textContent;
      }

      const selectElement = document.getElementById("productName");
      const allProducts = document.querySelectorAll(".card-title");
      selectElement.innerHTML = "";

      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "-- اختر المنتج --";
      selectElement.appendChild(defaultOption);

      allProducts.forEach(product => {
        if (product.textContent.trim() !== "") {
          const option = document.createElement("option");
          option.value = product.textContent;
          option.textContent = product.textContent;
          selectElement.appendChild(option);
        }
      });

      if (productTitle) {
        for (let i = 0; i < selectElement.options.length; i++) {
          if (selectElement.options[i].value === productTitle) {
            selectElement.selectedIndex = i;
            break;
          }
        }
      }
    });
  }
});



// كود تسجيل Service Worker المحسن (أضف هذا في script.js أو في ملف منفصل)

// التحقق من دعم المتصفح للـ Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then(registration => {
        console.log('Service Worker تم تسجيله بنجاح:', registration.scope);
        
        // التحقق من وجود تحديثات
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('يتم تثبيت service worker جديد...');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('Service Worker جديد مثبت ومتاح للاستخدام.');
              // يمكنك هنا إظهار إشعار للمستخدم بتحديث الصفحة
            }
          });
        });
      })
      .catch(error => {
        console.error('فشل في تسجيل Service Worker:', error);
      });
    
    // التعامل مع تحديثات Service Worker
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        console.log('تم تحديث Service Worker، جاري إعادة تحميل الصفحة...');
        window.location.reload();
      }
    });
  });
}
