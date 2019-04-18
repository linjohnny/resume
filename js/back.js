var auth = $(".auth").text();
var account = $(".account").text();
var layer = $(".layer").text();
var uri = "ws://" + window.location.host + "/ws?auth=" + auth + "&account=" + account + "&layer=" + layer;
var socket = new WebSocket(uri);
function doConnect() {

    socket.onopen = function (e) { };
    //socket.onclose = function (e) { onclose(); };
    //socket.send("");
    //[0]線上人數 [1]未回覆 [2]已回復
    socket.onmessage = function (e) {
        if (e.data == "PageTooMuch") {
            location.assign("/home/index?PageError");
        }
        else if (e.data == "TimeOUT") {
            socket.send("alive");
        }
        else {
            $(".onlineCount").text(e.data.split("_")[0]);
            $("#onlineUser").text(e.data.split("_")[0]);
            $("#ReMessageNOK").text(e.data.split("_")[1]);
            $("#ReMessageOK").text(e.data.split("_")[2]);
            console.log(e.data); /*socket.close(); */
        }

    };
    socket.onerror = function (e) { console.log(e.data); };
}

$("#logout").click(function () {
    socket.send("logout");
    $.ajax({
        type: "POST",
        url: "/Home/logOut",
        traditional: true,
        data: { auth: auth }
    })
    location.assign("/home/index");
})

$("#onlineUser").click(function () {
    $(".onlinedialog").dialog({
        width: 800,
        modal: true,
        title: "線上人員列表",
        autoOpen: false,
        resizable: false,
        open: function (event, ui) {
            $(".ui-widget-overlay").on("click", function () {
                $(".onlinedialog").dialog("close");
            });
        }
    }).dialog("open");
    $(".ui-dialog-titlebar").removeClass("ui-widget-header");
    $(".ui-dialog-title").addClass("dialogtitle");
    $(".onlinedialog").removeClass("ui-dialog-content");
    $(".onlinedialog").removeClass("ui-widget-content");
    $(".ui-dialog").css("padding", "0");
    $(".ui-dialog").css("overflow", "visible");
    $(".onlinedialog").parents("div.ui-dialog").css("top", "150px");
    $(".onlinedialog tbody tr").remove();

    getOnlineMember(1);
    
});

//換頁
$(".OnlinePageStyle").on("click", "a[pager]", function () {
    var pages = parseInt($(this).attr("pager"));
    getOnlineMember(pages);
});

function getOnlineMember(pages) {
    $.ajax({
        type: "POST",
        url: "/Company/getOnline",
        traditional: true,
        data: { auth: auth, page: pages }
    }).done(function (msg) {
        console.log(msg);
        $(".onlinedialog tbody tr").remove();
        $(".OnlinePageStyle a[pager]").unbind();

        Object(msg.userList).forEach(function (value, key) {
            $(".onlinedialog tbody").append(
                '<tr>' +
                '<td>' + value.account + '</td>' +
                '<td>' + value.name + '</td>' +
                '<td>' + value.lastLoginIp + '</td>' +
                '<td>' + moment(value.lastLoginTime).format("YYYY-MM-DD HH:mm:ss") + '</td>' +
                '<td>' + msg.upperLine[key] + '</td>' +
                '</tr>'
            );
        });


        var page = msg.maxPage;
        var maxpage = Math.ceil(page / 15);
        $(".OnlinePageStyle").show();
        $(".OnlinePageStyle #OnlineEndpager").attr("pager", maxpage);
        $(".OnlinePageStyle span a").remove();
        if (pages <= 5) {
            var ss = 10;
            if (maxpage < 10) {
                ss = maxpage;
            }
            for (var i = 1; i <= ss; i++) {
                $(".OnlinePageStyle span").append(
                    '<a pager="' + i + '" class="OnlinePager">' + i + '</a>'
                );
            }
        }
        else if ((pages + 5) > maxpage) {
            if (pages <= 10) {
                var ss = 10;
                if (maxpage < 10) {
                    ss = maxpage;
                }
                for (var i = 1; i <= ss; i++) {
                    $(".OnlinePageStyle span").append(
                        '<a pager="' + i + '" class="OnlinePager">' + i + '</a>'
                    );
                }
            }
            else {
                for (var i = maxpage - 10; i <= maxpage; i++) {
                    $(".OnlinePageStyle span").append(
                        '<a pager="' + i + '" class="OnlinePager">' + i + '</a>'
                    );
                }
            }
        }
        else {
            for (var i = -5; i <= 5; i++) {
                var pagess = pages + i;
                $(".OnlinePageStyle span").append(
                    '<a pager="' + pagess + '" class="OnlinePager">' + pagess + '</a>'
                );
            }
        }
        //for (var i = 1; i <= page; i++)
        //{
        //    $(".PageStyle span").append(
        //        '<a pager="'+i+'" class="Pager">'+i+'</a>'
        //    );
        //}
        $(".OnlinePageStyle span a[pager=" + pages + "]").addClass("OnlinePagerselect");
        if (page == 0) {
            $(".OnlinePageStyle").hide();
        }
    });
};


function onInit() {
    doConnect();
}
//window.
window.onload = function (e) {
    onInit();
}
window.onbeforeunload = function (e) {
    socket.close();
}