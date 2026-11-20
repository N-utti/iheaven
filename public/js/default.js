var datatable_langue = {
	"language": {
        "lengthMenu": "<span class='small'>총 보여줄 개수</span> _MENU_",
        "zeroRecords": "<div class='small text-center'>리스트가 존재하지 않습니다.</div>",
        "info": "현재 페이지 <span class='font-weight-bold'>_PAGE_</span>/<span class='font-weight-bold'>_PAGES_</span>",
        "infoEmpty": "",
        "infoFiltered": ""
    },
    "pageLength": 25
}

if (!Object.entries) {
	Object.entries = function( obj ){
	var ownProps = Object.keys( obj ),
	    i = ownProps.length,
	    resArray = new Array(i); // preallocate the Array
	while (i--)
	  resArray[i] = [ownProps[i], obj[ownProps[i]]];

	return resArray;
	}
};

function link (url) {
	document.location.href = url
}

function setCookie(cookie_name, value, hours) {
  var exdate = new Date();
  exdate.setTime(exdate.getTime() + ( hours * 60 * 60 * 1000 ) );
  // 설정 일수만큼 현재시간에 만료값으로 지정

  var cookie_value = escape(value) + ((hours == null) ? '' : ';    expires=' + exdate.toUTCString());
  document.cookie = cookie_name + '=' + cookie_value;
}

function getCookie(cookie_name) {
  var x, y;
  var val = document.cookie.split(';');

  for (var i = 0; i < val.length; i++) {
    x = val[i].substr(0, val[i].indexOf('='));
    y = val[i].substr(val[i].indexOf('=') + 1);
    x = x.replace(/^\s+|\s+$/g, ''); // 앞과 뒤의 공백 제거하기
    if (x == cookie_name) {
      return unescape(y); // unescape로 디코딩 후 값 리턴
    }
  }
}