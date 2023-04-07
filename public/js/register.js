document.getElementById("registerBtn").addEventListener("click",(event)=>{
    event.preventDefault();
    const form = document.getElementById("registerForm");
    const passsword = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (passsword === confirmPassword){
        form.submit();
    }else{
        document.getElementById("passwordErr").style.display = "block"
    }

})

