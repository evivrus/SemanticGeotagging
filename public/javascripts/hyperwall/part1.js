//resize the User-fields on resizes
            window.addEventListener('resize', $.debounce(800, resizeEventCallbackUser), false);


            /* Catch the callback from the window.resize Event and
            * resize every user box
            */
            function resizeEventCallbackUser() {
                var obj = $('#myTextDiv')[0];
                var hidden;
                childr = obj.children;
                for (i=0; i < childr.length; i++) {
                    f = childr[i];
                    if (/user\d/.test(f.id)) {
                        hidden =  ($('#'+ f.id + ' #leftRotate')[0].style.right != '');
                        if (hidden) showUser(f.id);
                        resizeUser(f.id);
                        if(hidden) hideUser(f.id);
                    }
                }
                setLimits();
            }


            /* Function that handles the actual resizing math
            *
            */
            function resizeUser(id) {  //id equals userX with X being the usernumber
                lr = $('div #' + id +' #leftRotate');
                nr = $('div #' + id +' #details');
                nr.bigtext();
                lr2 = lr[0];
                nr = nr[0];
                lr2.style.width = nr.offsetHeight + 'px'; 
                lr.bigtext();
                lr2.style.marginLeft  = '-' + (lr2.offsetHeight + lr2.offsetWidth) + 'px';
            }


            /* Remove user from the side-panel
            *
            */
            function removeUser(id) {
                obj = $('#'+ id)[0];
                obj.parentNode.removeChild(obj);

            }


            /* Is used by the EventListener on the click on user event
            *
            */
            function clickUser() {
                removeUser(this.parentNode.id);
            }

            var usercount = 0;

            /* Create a new user on the side-panel
            *
            */   
            function createNewUser(username_first, username_last, user_title,
            user_location)
            {
                usercount = usercount + 1; 
                var container;
                var lr; 
                var nr; 
                var newUser;
                var innerH;
                container = $('div #myTextDiv')[0];
                newUser = document.createElement("div");
                newUser.setAttribute('id', "user" + usercount);
                newUser.setAttribute('style', 'margin-top: 3px; background-color: #FFF; overflow: auto; width: 100%;');
                innerH = '<div id="leftRotate" style="position: absolute; padding-left: 2%; padding-right: 2%;  color: #000; background-color: #FFF;' +
                    '-moz-transform: rotate(-90deg); -moz-transform-origin: 100% 0%; -moz-box-sizing: border-box; '+
                    '-webkit-transform: rotate(-90deg); -webkit-transform-origin: 100% 0%; -webkit-box-sizing: border-box" >' +
                    '<div>' + username_first + '</div>' +
                    '</div>' +
                '<img id="picture" style="width: 30%; float: left; margin:0; padding: 0;" src="https://si0.twimg.com/profile_images/1478287405/me-shirt-square.jpg"/>' +
                '<div id="details" style="color: #000; margin-left: 30%; margin-right:5px; padding:0" >' +
                    '<div style="padding-bottom: 5%;">'+ username_first +' '+ username_last +'</div>' +
                    '<div>'+ user_title  +'</div>' +
                    '<div>'+ user_location +'</div>' +
                    '</div>';

                newUser.innerHTML = innerH;
                container.appendChild(newUser);
                resizeUser("user" +usercount);

                $('#user'+ usercount + ' #details')[0].addEventListener('click', clickUser , false);
                $('#user'+ usercount + ' #leftRotate')[0].addEventListener('click', toggleUser , false);
            }

            /* This function hides the details part
            *
            * TODO The function is still using hard-coded elements that could probably
            * be replaced by easier to maintain stylesheet-declarations.
            * It has to be determined if the desired change in looks is achieved
            * with stylesheets, too.
            */
            function hideUser(id) {
                var lr = $('#'+ id + ' #leftRotate')[0];
                var nr = $('#'+ id + ' #details')[0];
                var img = $('#'+ id + ' #picture')[0];

                nr.style.display = 'none';
                img.style.display = 'none';
                lr.parentNode.style.height=lr.offsetWidth + 'px';
                lr.parentNode.style.background = '';   //TODO: USE CSS CLASSES FOR THIS
                lr.style.right=lr.offsetHeight + 'px';
            }

            /* This funciton shows the user details part
            * 
            * TODO The argument about CSS mentioned in hiderUsers() naturally
            * applies here, too
            */
            function showUser(id) {
                var lr = $('#'+ id + ' #leftRotate')[0];
                var nr = $('#'+ id + ' #details')[0];
                var img = $('#'+ id + ' #picture')[0];

                nr.style.display = 'block';
                img.style.display = 'block';
                lr.parentNode.style.height='';
                lr.parentNode.style.backgroundColor = '#FFF'; //TODO: USE CSS CLASSES FOR THIS
                lr.style.right='';
            }

            /* This serves as a toggle for either hiding or showing users depending
            * on the context
            */
            function toggleUser() {
                if(this.style.right == '') {
                    hideUser(this.parentNode.id);
                    } else {
                    showUser(this.parentNode.id);
                }
            }