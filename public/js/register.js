//  () => {} means do something
// same like function () {}

document.addEventListener("DOMContentLoaded", () => {
    //wait until everything on the page is ready before running the rest of the code

    const form = document.getElementById("register-form"); 
    // form is a reference to the whole <form> element
    // i can access all the inputs inside the form using form.inputName.value
  
    form.addEventListener("submit", (e) => {//when the button is submitted
      e.preventDefault(); //stops the form from submitting the normal way (which reloads the page)
  
      const name = form.name.value.trim(); //trim() basically removes extra spaces at the beginning or end
      const email = form.email.value.trim(); //"  Muhammad Syukri  " becomes "Muhammad Syukri" with trim
      const password = form.password.value;
      const profilePic = form.profilePic.files[0]; // For now we just store the filename
  
      if (!name || !email || !password) {
        alert("Please fill in all required fields.");
        return;  
      }
  
      // Check if user already exists (by email)
      let users = JSON.parse(localStorage.getItem("users")) || []; //try to load the list of users from the browser storage. If it doesn't exist yet, start with empty list
      if (users.find(user => user.email === email)) { //loop through each user in the users list
        alert("An account with this email already exists.");
        return;
      }
  
      // Store new user using the form data
      const newUser = {
        name,
        email,
        password,
        profilePic: profilePic ? profilePic.name : null, //gets the name of the uploaded file (if any), or saves null if no file was selected
      };
  
      users.push(newUser);// adds the new user into that user list
      localStorage.setItem("users", JSON.stringify(users)); //we can only store text in localStorage, so we user stringify to turn the list into a text format
  
      alert("Registration successful! Redirecting to login...");
      window.location.href = "index.html"; // Redirect to login
    });
  });