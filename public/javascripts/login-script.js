
$('#floatingInput').on("input", function (event) {
    $.ajax({
        type: "post",
        url: "http://localhost:3000/validate/email",
        data: `email=${event.target.value}`,
        success: function (response) {
            if (response.status)
                $("#email").html("")
            else
                $("#email").html(`<p style="font-size: 14px;" class="text-danger text-start p-0 px-2 m-0 mb-3">${response.reason}</p>`)
        }
    });
});

$('#floatingPassword').on("input", function (event) {
    $.ajax({
        type: "post",
        url: "http://localhost:3000/validate/password",
        data: `password=${event.target.value}`,
        success: function (response) {
            if (response.status)
                $("#password").html("")
            else
                $("#password").html(`<p style="font-size: 14px;" class="text-danger text-start p-0 px-2 m-0 mb-3">${response.reason}</p>`)
        }
    });
});
