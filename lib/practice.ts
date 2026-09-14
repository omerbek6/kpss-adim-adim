export type Question = {
  q: string;
  options: string[];
  answer: number;
  explanation: string;
};
// Original learning exercises, not copied from Pegem or ÖSYM. Not a score predictor.
export const practice: Record<string, Question[]> = {
  's0-7': [
    {
      q: '84 sayısının 7 ile bölümünden elde edilen bölüm kaçtır?',
      options: ['10', '11', '12', '13', '14'],
      answer: 2,
      explanation:
        'Bölünen 84, bölen 7’dir. “84’ün içinde kaç tane 7 var?” diye düşün. 7 × 10 = 70; geriye 14 kalır. 14’ün içinde 2 tane daha 7 vardır. Bölüm 10 + 2 = 12, kalan 0’dır. Kontrol: 84 = 7 × 12 + 0.',
    },
    {
      q: '157 sayısının 12 ile bölümünden kalan kaçtır?',
      options: ['1', '3', '5', '7', '9'],
      answer: 0,
      explanation:
        '157’yi aşmayan en büyük 12 katını bul: 12 × 13 = 156. Sonraki kat 12 × 14 = 168 olduğu için büyüktür. 157 − 156 = 1 kalır. Bölüm 13, kalan 1’dir. Kalanın bölen 12’den küçük olduğunu da kontrol et.',
    },
    {
      q: 'Aşağıdaki sayılardan hangisi 9 ile tam bölünür?',
      options: ['124', '235', '346', '459', '568'],
      answer: 3,
      explanation:
        '9 ile bölünebilmek için rakamlar toplamı 9’un katı olmalıdır. Toplamlar: 124 → 7, 235 → 10, 346 → 13, 459 → 18, 568 → 19. Yalnız 18, 9’un katıdır; doğru seçenek 459’dur.',
    },
    {
      q: '4a2 üç basamaklı sayısı 3 ile tam bölünüyor. a rakamı kaç farklı değer alabilir?',
      options: ['2', '3', '4', '5', '6'],
      answer: 2,
      explanation:
        'Rakamları topla: 4 + a + 2 = 6 + a. Sayının 3 ile bölünmesi için bu toplam 3’ün katı olmalı. a bir rakamdır; 0’dan 9’a kadar olabilir. 6 + a’yı 3’ün katı yapan değerler a = 0, 3, 6, 9’dur. Dört değer vardır. a ortadaki basamak olduğu için 0 da kullanılabilir.',
    },
    {
      q: '53b üç basamaklı sayısı 5 ile tam bölünüyor. b’nin alabileceği değerlerin toplamı kaçtır?',
      options: ['0', '3', '5', '8', '10'],
      answer: 2,
      explanation:
        '5 ile tam bölünen bir sayının birler basamağı 0 veya 5’tir. Bu nedenle b = 0 ya da b = 5; sayılar 530 ve 535’tir. Soru değerlerin sayısını değil, toplamını istiyor: 0 + 5 = 5.',
    },
    {
      q: '7a4 üç basamaklı sayısı 4 ile tam bölünüyor. a’nın en büyük değeri kaçtır?',
      options: ['4', '5', '6', '7', '8'],
      answer: 4,
      explanation:
        '4 ile bölünebilmede son iki basamağa bakılır: a4. En büyük a’dan başla. a = 9 için 94, 4’e tam bölünmez (kalan 2). a = 8 için 84 = 4 × 21’dir. Dolayısıyla kullanılabilen en büyük a, 8’dir; sayı 784 olur.',
    },
    {
      q: 'Bir doğal sayının 6 ile bölümünde bölüm 8, kalan 4’tür. Sayı kaçtır?',
      options: ['48', '50', '52', '54', '56'],
      answer: 2,
      explanation:
        'Bölünen = bölen × bölüm + kalan. Bölen 6, bölüm 8, kalan 4 olduğuna göre sayı 6 × 8 + 4 = 48 + 4 = 52’dir. Kontrol: 52’nin içinde 8 tane 6 vardır ve 4 artar. 4, bölen 6’dan küçüktür.',
    },
    {
      q: 'Bir doğal sayının 7 ile bölümünden kalan 5’tir. Sayıya 11 eklenirse 7 ile bölümünden kalan kaç olur?',
      options: ['0', '1', '2', '3', '4'],
      answer: 2,
      explanation:
        'Sayıyı 7k + 5 diye yaz: 7k, 7’nin tam katı olan kısmıdır. 11 ekleyince 7k + 16 olur. 16’nın içinde 2 tane 7 vardır, 2 artar. Yani 7k + 16 = 7(k + 2) + 2; yeni kalan 2’dir. 16’yı doğrudan kalan yazma; kalan 7’den küçük olmalıdır.',
    },
    {
      q: 'Hem 6 hem 10 ile tam bölünebilen en küçük üç basamaklı doğal sayı kaçtır?',
      options: ['100', '110', '120', '150', '180'],
      answer: 2,
      explanation:
        '10 ile bölünen sayıların sonu 0’dır. En küçük üç basamaklı adaylardan başla: 100, 110, 120. 6 ile bölünmek için sayı hem çift olmalı hem rakamları toplamı 3’ün katı olmalı. 100’ün toplamı 1, 110’un toplamı 2, 120’nin toplamı 3’tür. İlk uygun sayı 120’dir. Kontrol: 120 ÷ 6 = 20, 120 ÷ 10 = 12.',
    },
    {
      q: 'Bir doğal sayının 8 ile bölümünden kalan 5’tir. Aynı sayının 4 ile bölümünden kalan kaçtır?',
      options: ['0', '1', '2', '3', '4'],
      answer: 1,
      explanation:
        'Sayıyı 8k + 5 olarak yaz. 8k, 4 ile de tam bölünür; çünkü 8’in her katı 4’ün de katıdır. Geriye 5 kısmı kalır. 5 = 4 × 1 + 1 olduğundan yeni kalan 1’dir. Eski kalan 5’i aynen kullanamayız; yeni kalan 4’ten küçük olmalıdır.',
    },
  ],
  's0-9': [
    {
      q: '1/3 + 1/6 = ?',
      options: ['1/9', '1/6', '1/3', '1/2', '2/3'],
      answer: 3,
      explanation: '2/6 + 1/6 = 3/6 = 1/2.',
    },
    {
      q: '5/6 − 1/4 = ?',
      options: ['1/2', '7/12', '2/3', '3/4', '5/12'],
      answer: 1,
      explanation: '10/12 − 3/12 = 7/12.',
    },
    {
      q: '(3/5) × (10/9) = ?',
      options: ['1/3', '1/2', '2/3', '3/2', '2'],
      answer: 2,
      explanation: '30/45 = 2/3.',
    },
    {
      q: '(4/7) ÷ (2/3) = ?',
      options: ['2/7', '8/21', '3/7', '7/6', '6/7'],
      answer: 4,
      explanation: 'İkinci kesri ters çevirip çarp: (4/7) × (3/2) = 6/7.',
    },
    {
      q: '−3/4 + 1/2 = ?',
      options: ['−1/4', '1/4', '−5/4', '5/4', '−1/2'],
      answer: 0,
      explanation: '−3/4 + 2/4 = −1/4.',
    },
    {
      q: '2 − (3/4 + 1/2) = ?',
      options: ['1/4', '1/2', '3/4', '1', '5/4'],
      answer: 2,
      explanation: 'Parantez 5/4’tür. 8/4 − 5/4 = 3/4.',
    },
    {
      q: '45 sayısının 2/5’i kaçtır?',
      options: ['9', '15', '18', '20', '25'],
      answer: 2,
      explanation: '45 ÷ 5 × 2 = 18.',
    },
    {
      q: '3/8 kesrinin ondalık gösterimi hangisidir?',
      options: ['0,125', '0,25', '0,3', '0,375', '0,75'],
      answer: 3,
      explanation: '3 ÷ 8 = 0,375.',
    },
    {
      q: 'Aşağıdaki rasyonel sayılardan hangisi en büyüktür?',
      options: ['−2/3', '−1/2', '−3/4', '−4/5', '−5/6'],
      answer: 1,
      explanation:
        'Negatif sayılarda sıfıra daha yakın olan daha büyüktür: −1/2.',
    },
    {
      q: '(1/2 + 1/3) ÷ (5/6) = ?',
      options: ['1', '5/6', '6/5', '25/36', '36/25'],
      answer: 0,
      explanation:
        'Parantez 5/6’dır. Sıfırdan farklı sayının kendisine bölümü 1’dir.',
    },
  ],
  's0-18': [
    {
      q: 'A/B = 2/3 ve A + B = 25 ise A kaçtır?',
      options: ['5', '8', '10', '12', '15'],
      answer: 2,
      explanation: '5 pay = 25. Bir pay 5, A = 2 × 5 = 10.',
    },
    {
      q: 'A/B = 4/7 ve A = 20 ise B kaçtır?',
      options: ['28', '30', '32', '35', '40'],
      answer: 3,
      explanation: '4 pay 20 ise bir pay 5. B = 7 × 5 = 35.',
    },
    {
      q: '12 erkek, 18 kız öğrencinin olduğu sınıfta erkek sayısının kız sayısına oranı nedir?',
      options: ['1/3', '2/3', '3/2', '3/5', '2/5'],
      answer: 1,
      explanation: '12/18 sadeleşince 2/3 olur.',
    },
    {
      q: 'Su/şurup oranı 5/2 olan içecekte 8 litre şuruba kaç litre su eklenir?',
      options: ['10', '16', '18', '20', '24'],
      answer: 3,
      explanation: '2 pay 8 litre ise bir pay 4 litre. Su = 5 × 4 = 20 litre.',
    },
    {
      q: 'Aynı hızla çalışan 3 işçi işi 12 günde bitiriyor. Günlük çalışma süresi değişmeden aynı hızdaki 6 işçi kaç günde bitirir?',
      options: ['3', '4', '6', '8', '24'],
      answer: 2,
      explanation: 'Ters orantı: 3 × 12 = 6 × gün. Gün = 6.',
    },
    {
      q: '5 aynı defter 60 TL. Birim fiyat değişmiyorsa 8 defter kaç TL?',
      options: ['72', '84', '90', '96', '100'],
      answer: 3,
      explanation: 'Bir defter 12 TL. 8 × 12 = 96 TL.',
    },
    {
      q: '1/100.000 ölçekli haritada 3 cm uzaklık gerçekte kaç kilometredir?',
      options: ['0,3', '3', '30', '300', '3000'],
      answer: 1,
      explanation: '1 cm haritada, gerçekte 100.000 cm = 1 km. 3 cm = 3 km.',
    },
    {
      q: 'Yaşları oranı 2/5, toplamı 42 olan iki kardeşten küçük olan kaç yaşındadır?',
      options: ['10', '12', '14', '18', '30'],
      answer: 1,
      explanation: '7 pay = 42; bir pay 6. Küçük kardeş 2 × 6 = 12.',
    },
    {
      q: 'Pozitif x, y için x/4 = y/7 ve x + y = 33. y − x kaçtır?',
      options: ['5', '7', '9', '11', '13'],
      answer: 2,
      explanation: 'x = 4k, y = 7k. 11k = 33, k = 3. Fark 3k = 9.',
    },
    {
      q: 'Kırmızı/mavi bilye oranı 3/5, toplam 64. Yalnız bu iki renk var. 8 kırmızı eklenirse kırmızı/mavi oranı kaç olur?',
      options: ['3/4', '4/5', '5/6', '1', '5/4'],
      answer: 1,
      explanation: '24 kırmızı, 40 mavi vardır. Yeni oran 32/40 = 4/5.',
    },
  ],
};
