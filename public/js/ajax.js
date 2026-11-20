function ajaxFunc(url, data) {
	$.ajax({
		type: "POST",
		url: url,
		data: data,
		success: function(data) {

		}
	})
}

function ItemImageAddChange(ts) {
	var file = $(ts)[0].files[0]

    var data = new FormData();
    data.append("image", file);
    $.ajax({
        data: data,
        type: "POST",
        url: "/ajax/item-image-upload.php",
        cache: false,
        contentType: false,
        processData: false,
        success: function(image) {
        	$(".item-image-add-list").append('<div class="item-list-item"><img src="/upload/item_image/'+image+'" class="rounded-sm border mr-2 mb-2"><input type="hidden" name="item_image_name[]" value="'+image+'"><span class="item-image-remove bg-danger text-white shadow"><i class="fa fa-times"></i></span></div>')
        	$(ts).val('')
        }
    });
}

function bannerImageChange(ts) {
	var file = $(ts)[0].files[0]
	var formData = new FormData()

	formData.append(
		'image', file
		)

	$.ajax({
	    url: '/ajax/banner-image-upload.php',
	    processData: false,  // 데이터 객체를 문자열로 바꿀지에 대한 값이다. true면 일반문자...
	    contentType: false,  // 해당 타입을 true로 하면 일반 text로 구분되어 진다.
	    data: formData,  //위에서 선언한 fromdata
	    type: 'POST',
	    success: function(result){
	        $('.now-banner-image img').attr('src', '/upload/banner/'+result)
	    },
	    error : function(e){
	    console.log(e);
	    }
	});
}

function snImageUpload(url, file, appendDom, imageRoute) {
    data = new FormData();
    data.append("image", file);
    $.ajax({
        data: data,
        type: "POST",
        url: url,
        cache: false,
        contentType: false,
        processData: false,
        success: function(url) {
			console.log(url)
        	$(appendDom).append('<img src="'+imageRoute+url+'">')
        }
    });
}

function frmSubmit(frm, url, msg, move) {
	$.ajax({
		type: "POST",
		url: url,
		data: $(frm).serialize(),
		success: function(data) {
			if(data) {
				alert(data)
			} else {
				if(msg != '') alert(msg)
				if (move != '') link(move)
				else location.reload()
			}
		}
	})

	return false
}