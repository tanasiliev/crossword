(function () {
    var cw = window.crossword;
    if (!cw) {
        cw = {};
        window.crossword = cw;
    }

    cw.count = 0;
    cw.row = null;
    cw.col = null;
    cw.currentBox = null;
    cw.ErrorMsg = null;

    function log(msg) {
        console.log(msg);
    }

    cw.word = {
        index: null,
        content: null,
        description: null,
        position: {
            row: null,
            col: null
        },
        align: null,
        backword: false,
        strartFrom: null
    };

    cw.OldWord = {
        index: null,
        content: null,
        description: null,
        position: {
            row: null,
            col: null
        },
        align: null,
        backword: false,
        strartFrom: null
    };

    cw.arrayWords = {};

    String.prototype.Length = function () {
        var this_ = this.replace(/\/(.+)/, "");
        this_ = this_.replace(/\"/g, "");
        return this_.replace(/\s/mg, '').length;
    };

    String.prototype.toArray = function () {
        var this_ = this.replace(/\/(.+)/, "");
        this_ = this_.replace(/\"/g, "");
        return this_.replace(/\s/mg, '');
    };

    String.prototype.WhiteSpace = function (n) {
        var str = "";
        for (var i = 0; i < n; i++)
            str += " ";
        return this + str;
    };

    cw.getElement = function (id) {
        var element = document.getElementById(id);
        return element;
    };

    cw.create = function (element, row, col) {
        cw.row = row;
        cw.col = col;

        element.style.display = "block";
        element.style.width = (col * 51) + "px";
        element.style.height = (row * 51) + "px";
        cw.AddOnClick(element);

        var frag = document.createDocumentFragment();
        for (var j = 0; j < row; j++) {
            for (var i = 0; i < col; i++) {
                var letter = document.createElement("div");
                letter.setAttribute("class", "letter");
                var id = j.toString() + "." + i.toString();
                letter.setAttribute("id", id);
                var p = document.createElement("p");
                letter.appendChild(p);
                frag.appendChild(letter);
            }
        }
        element.appendChild(frag);
    };

    cw.selectedBox = function (element) {
        var oldBox = cw.currentBox;
        if (oldBox) {
            oldBox.style.backgroundColor = "#fff";
        }
        cw.currentBox = element;
        element.style.backgroundColor = "#85D6FF";
    }

    cw.AddOnClick = function (element) {
        element.onclick = function (ev) {
            var id = ev.target.id;
            if (id == "")
                return;
            var index = id.indexOf(".");
            var row = id.substring(0, index)
            var col = id.substring(index + 1, id.length)
            cw.word.position.row = (row | 0);
            cw.word.position.col = (col | 0);
            cw.selectedBox(ev.target);
        }
    };

    cw.addDescriptionEvent = function (element) {
        element.onclick = function (ev) {
            var id = element.parentElement.id;
            var index = id.indexOf(".");
            var row = id.substring(0, index)
            var col = id.substring(index + 1, id.length)
            cw.word.position.row = (row | 0);
            cw.word.position.col = (col | 0);
        }
    };

    cw.isDescription = function (element) {
        var children = element.children;
        for (var i = 0; i < children.length; i++) {
            if (children[i].tagName == "DIV")
                return true;
        }
        return false;
    };

    cw.ValidateWord = function () {
        cw.ErrorMsg = [];
        if (!cw.word.content)
            cw.ErrorMsg.push("Не е виведена дума!");
        if (!cw.word.description)
            cw.ErrorMsg.push("Липсва описание!");
        if (cw.word.position.row === null || cw.word.position.col === null)
            cw.ErrorMsg.push("Не е избрана позиция!");
        if (!cw.ErrorMsg.length) {
            return true;
        }
        else {
            cw.PrintErrorMsg();
            return false;
        }
    };

    cw.CheckWordLength = function (row, col) {
        if (cw.OldWord.strartFrom == cw.word.strartFrom && cw.OldWord.position.col == cw.word.position.col
            && cw.OldWord.position.row == cw.word.position.row) {
            cw.ErrorMsg.push("Думата не може да започва \n от същата позоция като предишната!");
            return false;
        } else {
            if (cw.word.align == "h") {
                var _row = row;
                var _col = col + 1;
            }
            else {
                var _row = row + 1;
                var _col = col;
            }
            var box = cw.getElement(_row + "." + _col);
            if (box.getElementsByTagName("span")[0]) {
                cw.ErrorMsg.push("Текущата позоция вече е заета от друга дума !");
                return false;
            }
        }


        if (cw.col <= col + cw.word.content.Length() && cw.word.align == "h") {
            cw.ErrorMsg.push("Думата е прекалено дълга \n за да бъде добавена водоравно!");
            return false;
        }
        if (cw.row <= row + cw.word.content.Length() && cw.word.align == "v") {
            cw.ErrorMsg.push("Думата е прекалено дълга \n за да бъде добавена отвесно!");
            return false;
        }
        for (var i = 0; i < cw.word.content.Length() ; i++) {
            cw.word.align == "h" ? col += 1 : row += 1;
            var el = cw.getElement(row + "." + col);
            if (!el) {
                cw.ErrorMsg.push("Дума извън Kръстословицата!");
                return false;
            }
            var p = el.firstElementChild;
            if (p.innerHTML != "" && p.innerHTML != cw.word.content.toArray()[i].toUpperCase() || cw.isDescription(el)) {
                cw.ErrorMsg.push("Дадената дума променя някоя друга!");
                return false;
            }
        }
        return true;
    };


    cw.getRows = function (description) {
        description = description.trim();
        var match = description.match(/\n/g);
        if (match) {
            return match.length + 1;
        }
        return 1;
    };

    cw.setSpanPosition = function (span) {
        var rows = span.dataset.rows;
        if (span.dataset.startFrom == "d") {
            while (span.innerHTML[0] == "<") {
                span.innerHTML = span.innerHTML.replace(/<br>/, "");
            }
        }
        if (rows < 3) {
            span.innerHTML = "<br><br>" + span.innerHTML;
        }
        if (rows >= 3 && rows < 5) {
            span.innerHTML = "<br>" + span.innerHTML;
        }
    };
    cw.resetSpanPosition = function (span) {
        var rows = span.dataset.rows;
        if (rows < 3) {
            span.innerHTML = span.innerHTML.replace("<br><br>", "");
        }
        if (rows >= 3 && rows < 5) {
            span.innerHTML = span.innerHTML.replace("<br>", "");
        }
    };

    cw.newLine = function (n) {
        var newLine = "";
        for (var i = 0; i < n; i++) {
            newLine += "<br>";
        }
        return newLine;
    }

    cw.addDescription = function (word, parentElement) {
        var span = document.createElement("span");
        span.innerHTML = word.description.trim().replace(/\n/g, "<br>");
        var rows = cw.getRows(word.description);
        span.dataset.startFrom = word.strartFrom;
        span.dataset.rows = rows;
        span.dataset.first = true;
        cw.setSpanPosition(span);
        parentElement.appendChild(span);
    };

    cw.addSecondDescription = function (word, stratbox) {
        var span1 = stratbox.getElementsByTagName("div")[0].getElementsByTagName("span")[0];
        cw.resetSpanPosition(span1);
        var rows1 = span1.dataset.rows;
        var span2 = document.createElement("span");
        var rows2 = cw.getRows(word.description);
        span2.dataset.startFrom = word.strartFrom;
        span2.dataset.rows = rows2;
        var newLine = 6 - (parseInt(rows1) + parseInt(rows2));;
        if (span1.dataset.startFrom != "d") {
            span2.innerHTML = cw.newLine(newLine) + "<br>" + word.description.replace(/\n/g, "<br>");
            stratbox.getElementsByTagName("div")[0].appendChild(span2);
        }
        if (span1.dataset.startFrom == "d") {
            span2.innerHTML = word.description.replace(/\n/g, "<br>");
            span1.innerHTML = cw.newLine(newLine) + "<br>" + span1.innerHTML
            stratbox.getElementsByTagName("div")[0].insertBefore(span2, span1);
        }
    }

    cw.insertWord = function () {
        var row = cw.word.position.row;
        var col = cw.word.position.col;
        var stratbox = cw.getElement(row + "." + col);

        var pos = cw.setStartPosition(cw.word);
        if (!cw.CheckWordLength(pos.row, pos.col)) {
            cw.PrintErrorMsg();
            return;
        }
        if (!cw.isDescription(stratbox)) {
            var description_box = document.createElement("div");
            description_box.setAttribute("class", "t_letter");
            var p = document.createElement("p");
            cw.count += 1;
            p.innerHTML = cw.count;
            cw.word.index = cw.count;
            description_box.appendChild(p);
            cw.addDescription(cw.word, description_box);
            cw.addDescriptionEvent(description_box);
            stratbox.appendChild(description_box);
        }
        else {
            var index = stratbox.getElementsByTagName("div")[0].getElementsByTagName("p")[0];
            index.setAttribute("class", "duplicate");
            cw.word.index = index.innerHTML;
            cw.addSecondDescription(cw.word, stratbox);
        }
        cw.writeWord(pos.row, pos.col, cw.word);
        cw.addWord(cw.word);
        cw.resetWord();
        cw.ResetPrintErrorMsg();
        document.getElementById("w-content").value = "";
        document.getElementById("w-description").value = "";
    };

    cw.addWord = function (word) {
        var box = word.index.toString();
        for (var key in cw.arrayWords) {
            if (key == box) {
                cw.arrayWords[box].push(word);
                return;
            }
        }
        cw.arrayWords[box] = new Array();
        cw.arrayWords[box].push(word);
    };

    cw.setStartPosition = function (word) {
        var row = word.position.row;
        var col = word.position.col;

        if (word.align == "h" && word.strartFrom == "d") {
            row += 1;
            col -= 1;
        }
        if (word.align == "v") {
            if (word.strartFrom == "r") {
                row -= 1;
                col += 1;
            }
            if (word.strartFrom == "l") {
                row -= 1;
                col -= 1;
            }
        }
        return { row: row, col: col };
    };


    cw.writeWord = function (row, col, word) {
        if (!word.backword) {
            for (var i = 0; i < word.content.Length() ; i++) {
                word.align == "h" ? col += 1 : row += 1;
                var el = cw.getElement(row + "." + col);
                var p = el.firstElementChild;
                if (p.innerHTML == word.content.toArray()[i].toUpperCase())
                    p.setAttribute("class", "duplicate");
                p.innerHTML = word.content.toArray()[i].toUpperCase();
                if (i == 0)
                    cw.drawArrow(el, word);
            }
        }
        else {
            for (var i = word.content.Length() - 1; i >= 0; i--) {
                word.align == "h" ? col += 1 : row += 1;
                var el = cw.getElement(row + "." + col);
                var p = el.firstElementChild;
                if (p.innerHTML == word.content.toArray()[i].toUpperCase())
                    p.setAttribute("class", "duplicate");
                p.innerHTML = word.content.toArray()[i].toUpperCase();
                if (i == word.content.Length() - 1)
                    cw.drawArrow(el, word);
            }
        }
    };

    cw.drawArrow = function (elenemt, word) {
        var span = document.createElement("span");
        if (word.align == "h") {
            if (word.strartFrom == "r")
                span.setAttribute("class", "H-rigth-arrow");
            if (word.strartFrom == "d")
                span.setAttribute("class", "H-down-arrow");
        }
        if (word.align == "v") {
            if (word.strartFrom == "d")
                span.setAttribute("class", "V-down-arrow");
            if (word.strartFrom == "r")
                span.setAttribute("class", "V-rigth-arrow");
            if (word.strartFrom == "l")
                span.setAttribute("class", "V-left-arrow");
        }
        span.innerHTML = "<b><img id='triangle' src='assets/img/triangle.png'/></b>";

        var degree = word.align == "v" ? 90 : 0;
        if (word.backword)
            degree += 180;
        cw.rotate(span.getElementsByTagName("img")[0], degree);
        elenemt.appendChild(span);
    };

    cw.rotate = function (element, degree) {
        element.setAttribute("style", "-webkit-transform: rotate(" + degree + "deg);");
    }

    cw.WriteAnswers = function () {
        if (!cw.arrayWords[1]) {
            alert("Kръстословица е празна!");
            return;
        }
        var textarea = document.getElementById("Text");
        var fname = prompt("Напиши име на файл :", "file");

        textarea.value = "";
        cw.WriteDescription(textarea);
        cw.WriteDictionary(textarea);
        textarea.value += "\r\n".WhiteSpace(45) + "ОТГОВОРИ";
        cw.WriteAnswersHor(textarea);
        cw.WriteAnswersVer(textarea);

        if (fname)
            cw.saveTextFile(textarea, fname);
    };

    cw.WriteDictionary = function (textarea) {
        var text = document.getElementById('text-dictinary').value;
        if (text) {
            textarea.value += "  РЕЧНИК: " + text + "\r\n\r\n";
        }
    };

    cw.saveTextFile = function (textarea, fname) {
        var textToWrite = textarea.value;
        var textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' });
        var downloadLink = document.createElement("a");
        downloadLink.download = fname;
        downloadLink.innerHTML = "Download File";
        downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
        downloadLink.click();
    }

    cw.WriteDescription = function (textarea) {
        for (var key in cw.arrayWords) {
            var words = cw.arrayWords[key];
            for (var i = 0; i < words.length; i++) {
                var obj = words[i];
                var aling = obj.align == "h" ? "вод." : "отв.";
                var len = ("".WhiteSpace(5) + obj.index + "." + aling + "".WhiteSpace(2)).length;

                var description = obj.description.replace(/\n/mg, "\n" + "".WhiteSpace(len));
                if (obj.content.length < 9) {
                    var line = "".WhiteSpace(len - 2 - obj.content.Length() - 2) + "/" + obj.content.toArray().toLowerCase() + "/".WhiteSpace(2);
                    description = description.replace("".WhiteSpace(len), line);
                    if (obj.description.search("\n") < 0)
                        description = description + "\n" + line;
                }
                var text = "".WhiteSpace(5) + obj.index + "." + aling + "".WhiteSpace(2) + description;
                textarea.value += text + "\r\n";
            }
            textarea.value += "".WhiteSpace(5) + "----------------------" + "\r\n";
        }
    };

    cw.WriteAnswersHor = function (textarea) {
        textarea.value += "\n  ВОДОРАВНО: ";
        var count = 12;
        for (var row = 0; row < cw.row; row++) {
            for (var col = 0; col < cw.col; col++) {
                var el = cw.getElement(row + "." + col);
                var span = el.getElementsByTagName("span")[0];
                if (span && span.getAttribute("class")) {
                    if (span.getAttribute("class")[0] == "H") {
                        if (span.getAttribute("class") == "H-rigth-arrow")
                            count += cw.HorAnswers(textarea, row, col - 1, "r");
                        else
                            count += cw.HorAnswers(textarea, row - 1, col, "d");
                    }
                }
            }
            if (count > 60) {
                textarea.value += "\n";
                count = 0;
            }
        }
    };

    cw.HorAnswers = function (textarea, row, col, startFrom) {
        var box = cw.getElement(row + "." + col);
        var id = box.getElementsByTagName("div")[0].getElementsByTagName("p")[0].innerHTML;
        var words = cw.arrayWords[id];
        for (var i = 0; i < words.length; i++) {
            var obj = words[i];
            var separetor = null;
            if (startFrom == "r" && obj.strartFrom == "r") {
                separetor = col + obj.content.Length() + 1 > cw.col - 1 ? "+ " : ". ";
                textarea.value += obj.content + separetor;
                return obj.content.Length();
            }
            if (startFrom == "d" && obj.strartFrom == "d") {
                separetor = col + obj.content.Length() > cw.col - 1 ? "+ " : ". ";
                textarea.value += obj.content + separetor;
                return obj.content.Length();
            }
        }
    };

    cw.WriteAnswersVer = function (textarea) {
        textarea.value += "\n  ОТВЕСНО: ";
        var count = 12;
        for (var col = 0; col < cw.col; col++) {
            for (var row = 0; row < cw.row; row++) {
                var el = cw.getElement(row + "." + col);
                var span = el.getElementsByTagName("span")[0];
                if (span && span.getAttribute("class")) {
                    if (span.getAttribute("class")[0] == "V") {
                        if (span.getAttribute("class") == "V-down-arrow")
                            cw.VerAnswers(textarea, row - 1, col, "d");
                        else if (span.getAttribute("class") == "V-rigth-arrow")
                            cw.VerAnswers(textarea, row, col - 1, "r");
                        else
                            cw.VerAnswers(textarea, row, col + 1, "l");
                    }
                }
            }
            if (count > 60) {
                textarea.value += "\n";
                count = 0;
            }
        }
    };

    cw.VerAnswers = function (textarea, row, col, startFrom) {
        var box = cw.getElement(row + "." + col);
        var id = box.getElementsByTagName("div")[0].getElementsByTagName("p")[0].innerHTML;
        var words = cw.arrayWords[id];
        for (var i = 0; i < words.length; i++) {
            var obj = words[i];
            var separetor = null;
            if (startFrom == "d" && obj.strartFrom == "d") {
                separetor = row + obj.content.Length() + 1 > cw.row - 1 ? "+ " : ". ";
                textarea.value += obj.content + separetor;
                return obj.content.Length();
            }
            if (startFrom == "r" && obj.strartFrom == "r") {
                separetor = row + obj.content.Length() + 1 > cw.row ? "+ " : ". ";
                textarea.value += obj.content + separetor;
                return obj.content.Length();
            }
            if (startFrom == "l" && obj.strartFrom == "l") {
                separetor = row + obj.content.Length() + 1 > cw.row ? "+ " : ". ";
                textarea.value += obj.content + separetor;
                return obj.content.Length();
            }
        }
    };


    cw.DeleteLastWord = function () {
        if (!cw.OldWord.content) {
            alert("Настоящата дума липсва или вече е премахната!");
            return;
        }
        var row = cw.OldWord.position.row;
        var col = cw.OldWord.position.col;
        var box = cw.getElement(row + "." + col);
        box.style.backgroundColor = "#fff";
        var startBox = box.getElementsByTagName("div")[0];
        var p_index = startBox.getElementsByTagName("p")[0];
        if (p_index.hasAttribute("class")) {
            p_index.removeAttribute("class");
            var words = cw.arrayWords[p_index.innerHTML];
            for (var i = 0; i < words.length; i++) {
                if (words[i].content == cw.OldWord.content) {
                    cw.arrayWords[p_index.innerHTML].splice(i, 1);
                    break;
                }
            }
        }
        else {
            box.removeChild(startBox);
            delete cw.arrayWords[p_index.innerHTML];
            cw.count -= 1;
        }
        var pos = cw.setStartPosition(cw.OldWord);
        for (var i = 0; i < cw.OldWord.content.Length() ; i++) {
            cw.OldWord.align == "h" ? pos.col += 1 : pos.row += 1;
            var el = cw.getElement(pos.row + "." + pos.col);
            var p = el.firstElementChild;
            if (p.hasAttribute("class"))
                p.removeAttribute("class");
            else {
                el.innerHTML = "<p></p>";
            }
        }
        // delete span 
        var spanList = startBox.getElementsByTagName("span");
        var snapToRemove = startBox.lastElementChild;
        if (startBox.lastElementChild.dataset.startFrom == "d") {
            snapToRemove = snapToRemove.previousElementSibling;
        }
        for (var i = 0; i < spanList.length; i++) {
            if (!spanList[i].dataset.first) {
                startBox.removeChild(spanList[i]);
            }
        }
        cw.setSpanPosition(spanList[0]);
        document.getElementById("w-content").value = cw.OldWord.content;
        document.getElementById("w-description").value = cw.OldWord.description;
        cw.resetOldWord();
    };

    cw.PrintErrorMsg = function () {
        var element = document.getElementById("ErrorMsg");
        cw.ResetPrintErrorMsg();

        var ul = document.createElement("ul")
        var obj = cw.ErrorMsg;
        for (var msg in cw.ErrorMsg) {
            var li = document.createElement("li");
            li.innerHTML = cw.ErrorMsg[msg];
            ul.appendChild(li);
        }
        element.appendChild(ul);
    };

    cw.ResetPrintErrorMsg = function () {
        var element = document.getElementById("ErrorMsg");
        var old_ul = element.firstElementChild;
        if (old_ul)
            element.removeChild(old_ul);
    };

    cw.resetWord = function () {
        cw.OldWord = cw.word;
        cw.word = {
            content: null,
            description: null,
            position: {
                row: null,
                col: null
            },
            //,align: null
            backword: false
        };
    };

    cw.resetOldWord = function () {
        cw.OldWord = {
            content: null,
            description: null,
            position: {
                row: null,
                col: null
            },
            //,align: null
            backword: false
        };
    };

    cw.Local = {};
    cw.Local.getDimension = function () {
        return localStorage.getObject("dimension");
    }
    cw.Local.setDimension = function (row, col) {
        localStorage.setObject("dimension", { row: row, col: col });
    };
    cw.Local.ResetDimension = function () {
        localStorage.setObject("dimension", null);
    };
    cw.Local.getWords = function () {
        return localStorage.getObject("words");
    };
    cw.Local.setWords = function () {
        localStorage.setObject("words", cw.arrayWords);
    };
    cw.Local.ResetWords = function () {
        localStorage.setObject("words", null);
    };

    cw.Local.Write = function () {
        for (var key in cw.Local.getWords()) {
            var words = cw.Local.getWords()[key];
            for (var i = 0; i < words.length; i++) {
                var obj = words[i];
                cw.insertWordOld(obj)
            }
        }

    };

    cw.insertWordOld = function (word) {
        var row = word.position.row;
        var col = word.position.col;
        var stratbox = cw.getElement(row + "." + col);

        var pos = cw.setStartPosition(word);
        if (!cw.isDescription(stratbox)) {
            var description_box = document.createElement("div");
            description_box.setAttribute("class", "t_letter");
            var p = document.createElement("p");
            cw.count += 1;
            p.innerHTML = cw.count;
            word.index = cw.count;
            description_box.appendChild(p);
            cw.addDescription(word, description_box);
            cw.addDescriptionEvent(description_box);
            stratbox.appendChild(description_box);
        }
        else {
            var index = stratbox.getElementsByTagName("div")[0].getElementsByTagName("p")[0];
            index.setAttribute("class", "duplicate");
            word.index = index.innerHTML;
            cw.addSecondDescription(word, stratbox);
        }
        cw.writeWord(pos.row, pos.col, word);
        cw.addWord(word);
    };

}());