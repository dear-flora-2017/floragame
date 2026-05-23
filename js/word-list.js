// 接受任何正确的英文单词（只检查首字母和字符组成）
function isWordValid(letter, word) {
    const upperLetter = letter.toUpperCase();
    const upperWord = word.toUpperCase().trim();

    // Word must be at least 2 characters long
    if (upperWord.length < 2) {
        return false;
    }

    // Check if word starts with the correct letter
    if (upperWord.charAt(0) !== upperLetter) {
        return false;
    }

    // Check if word contains only English letters
    const letterRegex = /^[A-Z]+$/;
    if (!letterRegex.test(upperWord)) {
        return false;
    }

    // Accept any word that starts with the correct letter
    return true;
}