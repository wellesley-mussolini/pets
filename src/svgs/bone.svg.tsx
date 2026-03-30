"use client";

export const BoneIcon = () => (
    <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="boneClip">
          <path
            d="M66 353
               C20 345 -10 370 0 410
               C10 445 40 460 70 455
               C70 490 100 510 135 500
               C165 490 185 465 185 435
               C185 405 195 385 215 365
               L360 215
               C380 195 405 185 435 185
               C480 185 512 155 512 120
               C512 90 490 75 465 78
               C465 40 435 10 395 10
               C360 10 340 40 340 80
               C340 110 330 130 310 150
               L155 305
               C130 330 110 350 66 353Z"
          />
        </clipPath>
      </defs>
  
      {/* base */}
      <path
        d="M66 353
           C20 345 -10 370 0 410
           C10 445 40 460 70 455
           C70 490 100 510 135 500
           C165 490 185 465 185 435
           C185 405 195 385 215 365
           L360 215
           C380 195 405 185 435 185
           C480 185 512 155 512 120
           C512 90 490 75 465 78
           C465 40 435 10 395 10
           C360 10 340 40 340 80
           C340 110 330 130 310 150
           L155 305
           C130 330 110 350 66 353Z"
        fill="#FFE8C2"
      />
  
      {/* sombra interna */}
      <g clipPath="url(#boneClip)">
        <path
          d="M118 502
             C159 493 185 470 185 433
             C185 400 190 382 214 359
             L366 207
             C388 185 412 177 448 177
             C486 177 511 153 512 117
             C495 140 468 163 426 163
             C389 163 362 171 338 195
             L186 347
             C161 372 151 394 149 436
             C148 468 137 488 118 502Z"
          fill="#FFD185"
        />
      </g>
  
      {/* bolinhas inferiores */}
      <circle cx="35" cy="398" r="38" fill="#FFE8C2" />
      <circle cx="80" cy="460" r="38" fill="#FFE8C2" />
      <circle cx="109" cy="451" r="40" fill="#FFE8C2" />
  
      {/* bolinhas superiores */}
      <circle cx="396" cy="52" r="43" fill="#FFE8C2" />
      <circle cx="473" cy="117" r="39" fill="#FFD185" />
      <circle cx="446" cy="122" r="39" fill="#FFD185" />
      <circle cx="430" cy="94" r="43" fill="#FFE8C2" />
  
      {/* pontinhos */}
      <circle cx="142" cy="347" r="8" fill="#E29D63" />
      <circle cx="93" cy="462" r="8" fill="#E29D63" />
      <circle cx="137" cy="462" r="8" fill="#E29D63" />
      <circle cx="384" cy="49" r="8" fill="#E29D63" />
    </svg>
  );