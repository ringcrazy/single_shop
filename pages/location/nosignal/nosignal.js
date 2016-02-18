Mo.ready(function(M) {
    var dom = {
        reload: M.role("reload"),
        'show-signal': M.one(".no-signal")
    };

    dom.reload.on("click", function(e) {
        e.halt();
        window.location.reload();
    });
});