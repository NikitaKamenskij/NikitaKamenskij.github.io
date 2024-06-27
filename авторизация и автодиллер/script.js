let users = [
    { username: 'Билол', password: 'билол123', role: 'admin' },
    { username: 'никита', password: '1234', role: 'admin' },
  ];
  
  function switchForm(register = false) {
    const authForm = document.getElementById('authForm');
    const addCarForm = document.getElementById('add-car-form');
    const authMessage = document.getElementById('authMessage');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
  
    if (register) {
      authForm.style.display = 'none';
      addCarForm.style.display = 'block';
      authMessage.textContent = 'Регистрация';
      switchToRegister.style.display = 'none';
      switchToLogin.style.display = 'inline';
    } else {
      authForm.style.display = 'block';
      addCarForm.style.display = 'none';
      authMessage.textContent = 'Авторизация';
      switchToRegister.style.display = 'inline';
      switchToLogin.style.display = 'none';
    }
  }
  
  document.getElementById('switchToRegister').addEventListener('click', () => switchForm(true));
  document.getElementById('switchToLogin').addEventListener('click', () => switchForm(false));
  
  document.getElementById('authForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
      console.log('Успешная авторизация:', user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      window.location.href = 'index.html'; // Перенаправление на index.html после успешной авторизации
    } else {
      console.log('Неверные учетные данные');
      alert('Неверное имя пользователя или пароль!');
    }
  });
  
  class Car {
    constructor(model, year, price, image) {
      this.model = model;
      this.year = year;
      this.price = price;
      this.image = image;
    }
  }
  
  class CarDealer {
    constructor() {
      this.cars = this.loadCarsFromStorage();
    }
  
    addCar(car) {
      this.cars.push(car);
      this.saveCarsToStorage();
      this.updateCarList();
    }
  
    removeCar(model) {
      this.cars = this.cars.filter(car => car.model !== model);
      this.saveCarsToStorage();
      this.updateCarList();
    }
  
    updateCar(model, year, price, image) {
      const car = this.cars.find(car => car.model === model);
      if (car) {
        car.year = year;
        car.price = price;
        car.image = image;
        this.saveCarsToStorage();
        this.updateCarList();
      }
    }
  
    updateCarList() {
      const carList = document.getElementById("cars");
      carList.innerHTML = "";
      this.cars.forEach(car => {
        const carListItem = document.createElement("li");
        const image = document.createElement("img");
        image.src = car.image;
        image.alt = car.model;
        image.width = 100;
        carListItem.appendChild(image);
        carListItem.innerHTML += `
          <div>
            Model: ${car.model}<br>
            Year: ${car.year}<br>
            Price: $${car.price}
          </div>
          <button class="edit-button" data-model="${car.model}">Edit</button>
          <button class="delete-button" data-model="${car.model}">Delete</button>
        `;
        carList.appendChild(carListItem);
      });
    }
  
    saveCarsToStorage() {
      localStorage.setItem('cars', JSON.stringify(this.cars));
    }
  
    loadCarsFromStorage() {
      const storedCars = localStorage.getItem('cars');
      return storedCars ? JSON.parse(storedCars) : [];
    }
  }
  
  const dealer = new CarDealer();
  
  document.getElementById("add-car-form").addEventListener("submit", event => {
    event.preventDefault();
    const modelInput = document.getElementById("model");
    const yearInput = document.getElementById("year");
    const priceInput = document.getElementById("price");
    const imageInput = document.getElementById("image");
  
    if (modelInput && yearInput && priceInput && imageInput) {
      const model = modelInput.value;
      const year = yearInput.value;
      const price = priceInput.value;
      const image = imageInput.files[0];
  
      if (image) {
        const reader = new FileReader();
        reader.onload = () => {
          const car = new Car(model, year, price, reader.result);
          dealer.addCar(car);
          document.getElementById("add-car-form").reset();
        };
        reader.readAsDataURL(image);
      } else {
        alert("Please select an image");
      }
    }
  });
  
  document.getElementById("cars").addEventListener("click", event => {
    if (event.target.classList.contains("edit-button")) {
      const model = event.target.dataset.model;
      const car = dealer.cars.find(car => car.model === model);
      if (car) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.role === 'admin') {
          const editForm = document.createElement("form");
          editForm.innerHTML = `
            <label for="model">Model:</label>
            <input type="text" id="model" value="${car.model}"><br><br>
            <label for="year">Year:</label>
            <input type="number" id="year" value="${car.year}"><br><br>
            <label for="price">Price:</label>
            <input type="number" id="price" value="${car.price}"><br><br>
            <label for="image">Image:</label>
            <input type="file" id="image" accept="image/*"><br><br>
            <input type="submit" value="Update Car">
          `;
          document.body.appendChild(editForm);
          editForm.addEventListener("submit", event => {
            event.preventDefault();
            const modelInput = document.getElementById("model");
            const yearInput = document.getElementById("year");
            const priceInput = document.getElementById("price");
            const imageInput = document.getElementById("image");
  
            if (modelInput && yearInput && priceInput && imageInput) {
              const model = modelInput.value;
              const year = yearInput.value;
              const price = priceInput.value;
              const image = imageInput.files[0];
  
              if (image) {
                const reader = new FileReader();
                reader.onload = () => {
                  dealer.updateCar(model, year, price, reader.result);
                  editForm.remove();
                };
                reader.readAsDataURL(image);
              } else {
                dealer.updateCar(model, year, price, car.image);
                editForm.remove();
              }
            }
          });
        } else {
          alert('Только администраторы могут редактировать автомобили!');
        }
      }
    } else if (event.target.classList.contains("delete-button")) {
      const model = event.target.dataset.model;
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser && currentUser.role === 'admin') {
        dealer.removeCar(model);
      } else {
        alert('Только администраторы могут удалять автомобили!');
      }
    }
  });