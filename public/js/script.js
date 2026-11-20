$(function() {
	// $('.content-bg').css({"padding-top": $("#header").innerHeight()+"px" })

	$('body').append('\
      <div class="rgba-background" style="display:none;"></div>\
      <div class="page-bot-btn">\
      <img src="/images/icon/btn_reserve.png" alt="예약" onClick="link(\'/page/reservation/standby.php\');" class="cursor-pointer d-md-block d-none" />\
      <img src="/images/icon/btn_call.png" alt="전화" onClick="link(\'tel:' + keyPhoneNo + '\');" class="cursor-pointer d-md-none d-block" />\
      <img src="/images/icon/btn_reserve.png" alt="예약" onClick="link(\'/page/reservation/standby.php\');" class="cursor-pointer d-md-none d-block" />\
      </div>\
  ')

  // <div class="scroll-top-button"><img src="/images/icon/top-button.png" alt="탑버튼" /></div>\
	
	$('[data-toggle="tooltip"]').tooltip()

	new WOW().init()

	modalControl();
})

$(document).on('click', 'totggle-menu-bar', function(e){
    e.stopPropagation(); 
    // some action ...
});

// $(document).on('click', '#header li.menu-active a', function(e) {
//   e.preventDefault()
// })

$(document).on('click', '.scroll-top-button', function(e) {
  $(window).scrollTop(0)
})

$(document).on('click', '.open-modal-image', function(e) {
	var img_src = $(this).find('img').attr('src')

	$("#image-modal .content img").attr('src', img_src);
	$("#image-modal-height-full .content img").attr('src', img_src);
})

$(document).on('click', '*[data-toggle="collapse"]', function(e) {
	e.preventDefault()
})

$(document).on('click', '.list-group-item', function() {
	var el = $(this).find('.menu-toggle-icon')

	if ($(el).hasClass('fa-chevron-right')) {
		$(el).addClass('fa-chevron-down')
		$(el).removeClass('fa-chevron-right')
	} else {
		$(el).addClass('fa-chevron-right')
		$(el).removeClass('fa-chevron-down')
	}
});

$(document).on('click', '.note-editor a[href="#"]', function(e) {
	e.preventDefault()
})

$(window).scroll(function(){
	var $header=$("#header");
	var scrolltop=$(this).scrollTop();
	
	if(scrolltop>100){
		if(!$header.hasClass("scrolled")) $header.addClass("scrolled");
	}
	else{
		if($header.hasClass("scrolled")) $header.removeClass("scrolled");
	}
});

$('#footer-branches').change(function() {
	var url = $(this).val();
	if( url.length > 0 )
		location.href = url + '/link.php';
});

$('#footer-branches-mobile').change(function() {
	var url = $(this).val();
	if( url.length > 0 )
		location.href = url + '/link.php';
});

function kakaoClickEvent() {
  // gtag('event', <action>, {
  //   'event_category': <kakao>,
  //   'event_label': <home>,
  //   'value': <0>
  // });
}

// 모달창 이벤트
function modalControl() {
	$.ajax({
		type: "POST",
		url: "/ajax/modal-html.php",
		success: function(html) {
			$('body').append(html);
		}
	})

	$(document).on('click', '.custom-modal-btn', function(e) {
		e.preventDefault();
		var target = $(this).attr('data-target')

		$(target).fadeIn()
		$('.rgba-background').fadeIn()
	})

	$(document).on('click', '.custom-modal .modal-close button', function(e) {
		$('.custom-modal').fadeOut()
		$('.rgba-background').fadeOut()
	})
}

function daumAddressSearchClick(zonecodeEl, addressEl) {
	new daum.Postcode({
        oncomplete: function(data) {
        	$(zonecodeEl).val(data.zonecode)
        	$(addressEl).val(data.address)
        }
    }).open();
}

function snNoteActive(snNoteDom, height, theme, imageUploadUrl, appendDom, imageRoute) {
	$(snNoteDom).summernote({
        height: height,
        lang: 'ko-KR',
        // theme: 'darkly',
        theme: theme,
        callbacks: {
        	onImageUpload: function(files) {
        		$.each(files, function(k, file) {
        			snImageUpload(imageUploadUrl, file, appendDom, imageRoute);
        		})
        	}
    	}
	});
}

function prevCalendar() {//이전 달
    // 이전 달을 today에 값을 저장하고 달력에 today를 넣어줌
    //today.getFullYear() 현재 년도//today.getMonth() 월  //today.getDate() 일 
    //getMonth()는 현재 달을 받아 오므로 이전달을 출력하려면 -1을 해줘야함
     today = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
     buildCalendar(); //달력 cell 만들어 출력 
    }

    function nextCalendar() {//다음 달
        // 다음 달을 today에 값을 저장하고 달력에 today 넣어줌
        //today.getFullYear() 현재 년도//today.getMonth() 월  //today.getDate() 일 
        //getMonth()는 현재 달을 받아 오므로 다음달을 출력하려면 +1을 해줘야함
        today = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

        buildCalendar();//달력 cell 만들어 출력
    }
    function buildCalendar(){//현재 달 달력 만들기
      var week = ['일', '월', '화', '수', '목', '금', '토'];
        var nd = new Date()
        var nowDate = new Date(nd.getFullYear(), nd.getMonth(), nd.getDate() - 1)

        var doMonth = new Date(today.getFullYear(),today.getMonth(),1);
        //이번 달의 첫째 날,
        //new를 쓰는 이유 : new를 쓰면 이번달의 로컬 월을 정확하게 받아온다.     
        //new를 쓰지 않았을때 이번달을 받아오려면 +1을 해줘야한다. 
        //왜냐면 getMonth()는 0~11을 반환하기 때문
        var lastDate = new Date(today.getFullYear(),today.getMonth() + 1,0);
        //이번 달의 마지막 날
        //new를 써주면 정확한 월을 가져옴, getMonth()+1을 해주면 다음달로 넘어가는데
        //day를 1부터 시작하는게 아니라 0부터 시작하기 때문에 
        //대로 된 다음달 시작일(1일)은 못가져오고 1 전인 0, 즉 전달 마지막일 을 가져오게 된다
        var tbCalendar = document.getElementById("calendar");
        //날짜를 찍을 테이블 변수 만듬, 일 까지 다 찍힘
        var tbCalendarYM = document.getElementById("tbCalendarYM");
        var month_en_name = document.getElementById("month-en-name");
        //테이블에 정확한 날짜 찍는 변수
        //innerHTML : js 언어를 HTML의 권장 표준 언어로 바꾼다
        //new를 찍지 않아서 month는 +1을 더해줘야 한다. 
         tbCalendarYM.innerHTML = today.getFullYear() + ". " + (today.getMonth() + 1 < 10 ? "0"+(today.getMonth() + 1) : today.getMonth() + 1); 
         month_en_name.innerHTML = monthNames[today.getMonth()];

         /*while은 이번달이 끝나면 다음달로 넘겨주는 역할*/
        while (tbCalendar.rows.length > 2) {
        //열을 지워줌
        //기본 열 크기는 body 부분에서 2로 고정되어 있다.
              tbCalendar.deleteRow(tbCalendar.rows.length-1);
              //테이블의 tr 갯수 만큼의 열 묶음은 -1칸 해줘야지 
            //30일 이후로 담을달에 순서대로 열이 계속 이어진다.
         }
         var row = null;
         row = tbCalendar.insertRow();
         //테이블에 새로운 열 삽입//즉, 초기화
         var cnt = 0;// count, 셀의 갯수를 세어주는 역할
        // 1일이 시작되는 칸을 맞추어 줌
         for (i=0; i<doMonth.getDay(); i++) {
         /*이번달의 day만큼 돌림*/
              cell = row.insertCell();//열 한칸한칸 계속 만들어주는 역할
              cnt = cnt + 1;//열의 갯수를 계속 다음으로 위치하게 해주는 역할
         }
        /*달력 출력*/
         for (i=1; i<=lastDate.getDate(); i++) { 

            var lastDateC = new Date(lastDate.getFullYear(), lastDate.getMonth(), i)
            var prevDateChk = (lastDateC > nowDate) ? "" : "prev-date"
            var now_chk = lastDateC.getFullYear() == nd.getFullYear() && lastDateC.getMonth() == nd.getMonth() && lastDateC.getDate() == nd.getDate()
            // 현재 페이지면 예약 선택
            if(now_chk) {
              $('#select_date').val(nd.getFullYear()+"-"+(nd.getMonth() + 1 < 10 ? "0"+(nd.getMonth() + 1) : nd.getMonth() + 1)+"-"+(nd.getDate() < 10 ? "0"+nd.getDate() : nd.getDate()))
              var date_name = week[nd.getDay()]

              $('.calendar-active-info span').text('선택하신 날짜는 '+nd.getFullYear()+'년 '+(nd.getMonth() + 1)+'월 '+nd.getDate()+'일 - '+date_name+'요일 입니다.')
            }
         //1일부터 마지막 일까지 돌림
              cell = row.insertCell();//열 한칸한칸 계속 만들어주는 역할
              cell.innerHTML = '<span class="span-day '+(now_chk ? 'active-day' : '')+' '+prevDateChk+'" data-date="'+(lastDate.getFullYear()+"-"+(lastDate.getMonth() + 1 < 10 ? lastDate.getMonth() + 1 : lastDate.getMonth() + 1)+"-"+(i < 10 ? i : i))+'">'+i+'</span>';//셀을 1부터 마지막 day까지 HTML 문법에 넣어줌
              cnt = cnt + 1;//열의 갯수를 계속 다음으로 위치하게 해주는 역할
          if (cnt % 7 == 1) {/*일요일 계산*/
              //1주일이 7일 이므로 일요일 구하기
              //월화수목금토일을 7로 나눴을때 나머지가 1이면 cnt가 1번째에 위치함을 의미한다
            // cell.innerHTML = "<font color=#F79DC2>" + i
            //1번째의 cell에만 색칠
        }    
          if (cnt%7 == 0){/* 1주일이 7일 이므로 토요일 구하기*/
              //월화수목금토일을 7로 나눴을때 나머지가 0이면 cnt가 7번째에 위치함을 의미한다
              // cell.innerHTML = "<font color=skyblue>" + i
              //7번째의 cell에만 색칠
               row = calendar.insertRow();
               //토요일 다음에 올 셀을 추가
          }
          /*오늘의 날짜에 노란색 칠하기*/
          // if (today.getFullYear() == date.getFullYear()
          //    && today.getMonth() == date.getMonth()
          //    && i == date.getDate()) {
          //     //달력에 있는 년,달과 내 컴퓨터의 로컬 년,달이 같고, 일이 오늘의 일과 같으면
          //   cell.bgColor = "#FAF58C";//셀의 배경색을 노랑으로 
          //  }
         }
    }