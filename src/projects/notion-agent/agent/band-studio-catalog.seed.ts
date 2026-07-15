/**
 * 합주실 카탈로그 시드 — band-room.com에서 1회 스냅샷한 데이터.
 *
 * ⚠️ 이 프로젝트는 조회 시 band-room.com에 의존하지 않는다. 이 시드가 우리 DB(sb_band_studio)로
 * 들어가고(BandStudioService.onModuleInit), 실시간 룸/빈시간은 네이버 예약을 직접 조회한다.
 * band-room.com이 사라져도 이 스냅샷 + 네이버 직접 조회로 동작한다.
 *
 * 갱신: band-room이 살아있는 동안 BandStudioService.refreshFromBandRoom()로 upsert 하거나,
 * 이 파일을 다시 생성해 커밋한다. (스냅샷 일시: 2026-07-15, 총 122곳 / 네이버예약 60곳)
 */

export interface BandStudioSeed {
  externalId: string;
  name: string;
  region: string;
  address: string;
  priceRange: string;
  openHours: string;
  amenities: string[];
  rooms: Array<{ name: string; price: string }>;
  naverUrl: string | null;
  businessId: string | null;
  bizItemId: string | null;
}

export const BAND_STUDIO_SEED: BandStudioSeed[] = [
  {
    "externalId": "studio-합정/홍대-st-music",
    "name": "ST music",
    "region": "합정/홍대",
    "address": "서울특별시 마포구 와우산로29길 54",
    "priceRange": "10,000원~15,000원",
    "openHours": "07:00~23:00",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "마이크"
    ],
    "rooms": [
      {
        "name": "B Room",
        "price": "13,000원"
      },
      {
        "name": "A Room",
        "price": "15,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/491097/items/3949065?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "491097",
    "bizItemId": "3949065"
  },
  {
    "externalId": "studio-합정/홍대-그라운드-본점",
    "name": "그라운드 본점",
    "region": "합정/홍대",
    "address": "서울 마포구 양화로 147 지하2층",
    "priceRange": "12,000원~22,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "키보드",
      "마이크"
    ],
    "rooms": [
      {
        "name": "A1룸",
        "price": "18,000원"
      },
      {
        "name": "A2룸",
        "price": "17,000원"
      },
      {
        "name": "A3룸",
        "price": "17,000원"
      },
      {
        "name": "B1룸",
        "price": "16,000원"
      },
      {
        "name": "B2룸",
        "price": "15,000원"
      },
      {
        "name": "C룸",
        "price": "14,000원"
      },
      {
        "name": "D룸",
        "price": "13,000원"
      },
      {
        "name": "E룸",
        "price": "12,000원"
      },
      {
        "name": "S룸",
        "price": "22,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1061592",
    "businessId": "1061592",
    "bizItemId": null
  },
  {
    "externalId": "studio-합정/홍대-그라운드-합정1호점",
    "name": "그라운드 합정1호점",
    "region": "합정/홍대",
    "address": "서울 마포구 양화로10길 49 BK빌딩 B2",
    "priceRange": "14,000원~22,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "키보드",
      "마이크"
    ],
    "rooms": [
      {
        "name": "A룸",
        "price": "16,000원"
      },
      {
        "name": "B룸",
        "price": "14,000원"
      },
      {
        "name": "C룸",
        "price": "14,000원"
      },
      {
        "name": "Jazz룸",
        "price": "14,400~18,000원/시간"
      },
      {
        "name": "S룸",
        "price": "22,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/331813",
    "businessId": "331813",
    "bizItemId": null
  },
  {
    "externalId": "studio-합정/홍대-디엠",
    "name": "디엠",
    "region": "합정/홍대",
    "address": "서울특별시 마포구 양화로6길 79, 지1층",
    "priceRange": "12,000원~16,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "2번방",
        "price": "12,000원"
      },
      {
        "name": "1번방",
        "price": "16,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1240775/items/7149587?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1240775",
    "bizItemId": "7149587"
  },
  {
    "externalId": "studio-합정/홍대-라라",
    "name": "라라",
    "region": "합정/홍대",
    "address": "서울특별시 마포구 잔다리로 99, 지하1층",
    "priceRange": "13,000원~19,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "V룸",
        "price": "19,000원"
      },
      {
        "name": "R룸",
        "price": "18,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1314022/items/6438431?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1314022",
    "bizItemId": "6438431"
  },
  {
    "externalId": "studio-합정/홍대-별나무",
    "name": "별나무",
    "region": "합정/홍대",
    "address": "서울 마포구 양화로12길 23 지층",
    "priceRange": "14,000원~21,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "키보드",
      "마이크"
    ],
    "rooms": [
      {
        "name": "R룸",
        "price": "19,000원"
      },
      {
        "name": "Y룸",
        "price": "18,000원"
      },
      {
        "name": "T룸",
        "price": "14,000원"
      },
      {
        "name": "J룸",
        "price": "14,000원"
      },
      {
        "name": "V룸",
        "price": "21,000원"
      }
    ],
    "naverUrl": "https://startree.co.kr/",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-합정/홍대-불리스튜디오",
    "name": "불리스튜디오",
    "region": "합정/홍대",
    "address": "서울 마포구 동교로 100, B101",
    "priceRange": "15,000원~18,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "NIGHTMARE",
        "price": "15,000원"
      },
      {
        "name": "HELL",
        "price": "18,000원"
      }
    ],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-합정/홍대-브라운",
    "name": "브라운",
    "region": "합정/홍대",
    "address": "서울 마포구 어울마당로5길 17 지하1층",
    "priceRange": "13,000원~16,000원/시간",
    "openHours": "11:00~24:00",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "키보드",
      "마이크"
    ],
    "rooms": [
      {
        "name": "그린룸",
        "price": "15,000원"
      },
      {
        "name": "옐로우룸",
        "price": "14,000원"
      },
      {
        "name": "그레이룸",
        "price": "13,000원"
      },
      {
        "name": "브라운룸",
        "price": "16,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/13/bizes/1574159",
    "businessId": "1574159",
    "bizItemId": null
  },
  {
    "externalId": "studio-합정/홍대-사운드시티",
    "name": "사운드시티",
    "region": "합정/홍대",
    "address": "서울 마포구 잔다리로 35 서원빌딩 B1",
    "priceRange": "14,000원~24,000원/시간",
    "openHours": "10:00~02:00",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "키보드",
      "마이크"
    ],
    "rooms": [
      {
        "name": "Room A",
        "price": "20,000원"
      },
      {
        "name": "Room B",
        "price": "20,000원"
      },
      {
        "name": "Room C",
        "price": "18,000원"
      },
      {
        "name": "Room D",
        "price": "14,000원"
      },
      {
        "name": "Room E",
        "price": "14,000원"
      },
      {
        "name": "Live Room",
        "price": "24,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1033058",
    "businessId": "1033058",
    "bizItemId": null
  },
  {
    "externalId": "studio-합정/홍대-사운드시티-홍대점",
    "name": "사운드시티 홍대점",
    "region": "합정/홍대",
    "address": "서울 마포구 양화로 156 2층 212호",
    "priceRange": "14,000원~18,000원/시간",
    "openHours": "24시간",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "키보드",
      "마이크"
    ],
    "rooms": [
      {
        "name": "Room 2",
        "price": "18,000원"
      },
      {
        "name": "Room 3",
        "price": "18,000원"
      },
      {
        "name": "Room 4",
        "price": "18,000원"
      },
      {
        "name": "Room 5",
        "price": "18,000원"
      },
      {
        "name": "Room 1",
        "price": "18,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1410283/items/6747150?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1410283",
    "bizItemId": "6747150"
  },
  {
    "externalId": "studio-합정/홍대-스팟사운드",
    "name": "스팟사운드",
    "region": "합정/홍대",
    "address": "서울특별시 마포구 독막로 52 엘림오피스텔 지하1층",
    "priceRange": "10,000원~13,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "호랑이1",
        "price": "13,000원"
      }
    ],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-합정/홍대-앨리",
    "name": "앨리",
    "region": "합정/홍대",
    "address": "서울특별시 마포구 서교동 376-12 지우빌딩 지하",
    "priceRange": "13,000원~16,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "부스2",
        "price": "13,000원"
      },
      {
        "name": "부스3",
        "price": "13,000원"
      },
      {
        "name": "부스4",
        "price": "13,000원"
      },
      {
        "name": "부스1",
        "price": "16,000원"
      }
    ],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-합정/홍대-에비로드",
    "name": "에비로드",
    "region": "합정/홍대",
    "address": "서울 마포구 독막로 17-1 지하1층",
    "priceRange": "13,000원~20,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "키보드",
      "마이크"
    ],
    "rooms": [
      {
        "name": "B룸",
        "price": "15,000원"
      },
      {
        "name": "C룸",
        "price": "13,000원"
      },
      {
        "name": "A룸",
        "price": "20,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/844479",
    "businessId": "844479",
    "bizItemId": null
  },
  {
    "externalId": "studio-합정/홍대-오렌지",
    "name": "오렌지",
    "region": "합정/홍대",
    "address": "서울 마포구 와우산로35길 55 B2",
    "priceRange": "12,000원~17,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "키보드",
      "마이크"
    ],
    "rooms": [
      {
        "name": "2번룸",
        "price": "15,000원"
      },
      {
        "name": "3번룸",
        "price": "13,000원"
      },
      {
        "name": "4번룸",
        "price": "12,000원"
      },
      {
        "name": "개러지룸",
        "price": "17,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/95732",
    "businessId": "95732",
    "bizItemId": null
  },
  {
    "externalId": "studio-합정/홍대-웨이브랩",
    "name": "웨이브랩",
    "region": "합정/홍대",
    "address": "서울 마포구 양화로 73-1 이스턴빌딩 B1",
    "priceRange": "18,000원~22,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "키보드",
      "마이크"
    ],
    "rooms": [
      {
        "name": "R2룸",
        "price": "20,000원"
      },
      {
        "name": "A룸",
        "price": "18,000원"
      },
      {
        "name": "R1룸",
        "price": "22,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/70462",
    "businessId": "70462",
    "bizItemId": null
  },
  {
    "externalId": "studio-합정/홍대-웨이브랩2호점",
    "name": "웨이브랩2호점",
    "region": "합정/홍대",
    "address": "서울특별시 마포구 월드컵로 37, B층 101호,102호",
    "priceRange": "19,800원~22,000원",
    "openHours": "운영시간 문의",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "마이크"
    ],
    "rooms": [
      {
        "name": "Back In Black",
        "price": "22,000원"
      },
      {
        "name": "Kind Of Blue",
        "price": "22,000원"
      },
      {
        "name": "After School Tea Time",
        "price": "22,000원"
      },
      {
        "name": "White Room",
        "price": "22,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1415457/items/6761289?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1415457",
    "bizItemId": "6761289"
  },
  {
    "externalId": "studio-합정/홍대-이막",
    "name": "이막",
    "region": "합정/홍대",
    "address": "서울특별시 마포구 잔다리로7길 38, 지하1층",
    "priceRange": "13,600원~16,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "B룸",
        "price": "15,500원"
      },
      {
        "name": "A룸",
        "price": "18,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1385421/items/6686059?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1385421",
    "bizItemId": "6686059"
  },
  {
    "externalId": "studio-합정/홍대-제시뮤직",
    "name": "제시뮤직",
    "region": "합정/홍대",
    "address": "서울 마포구 월드컵북로1길 18 지하 1층",
    "priceRange": "14,000원~18,000원/시간",
    "openHours": "09:00~02:00",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "키보드",
      "마이크"
    ],
    "rooms": [
      {
        "name": "합주실 A",
        "price": "16,000원"
      },
      {
        "name": "합주실 B",
        "price": "14,000원"
      },
      {
        "name": "합주실 R",
        "price": "18,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/446860",
    "businessId": "446860",
    "bizItemId": null
  },
  {
    "externalId": "studio-합정/홍대-제시뮤직합정점",
    "name": "제시뮤직합정점",
    "region": "합정/홍대",
    "address": "서울특별시 마포구 양화로 64, 지하 2층 202호",
    "priceRange": "가격 확인 필요",
    "openHours": "영업시간 확인 필요",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "마이크"
    ],
    "rooms": [
      {
        "name": "합주실 달",
        "price": ""
      },
      {
        "name": "합주실 별",
        "price": ""
      },
      {
        "name": "합주실 해",
        "price": ""
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1582546/items/7386250?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1582546",
    "bizItemId": "7386250"
  },
  {
    "externalId": "studio-합정/홍대-차마스튜디오",
    "name": "차마스튜디오",
    "region": "합정/홍대",
    "address": "서울특별시 마포구 동교로12길 13, 지하 1층",
    "priceRange": "15,000원~20,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "BURGUNDY",
        "price": "15,000원"
      },
      {
        "name": "Black",
        "price": "20,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/114414/items/2663395?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "114414",
    "bizItemId": "2663395"
  },
  {
    "externalId": "studio-합정/홍대-하모닉스1호점",
    "name": "하모닉스1호점",
    "region": "합정/홍대",
    "address": "서울 마포구 동교로25길 7 지층",
    "priceRange": "14,000원~20,000원/시간",
    "openHours": "24시간",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "키보드",
      "마이크"
    ],
    "rooms": [
      {
        "name": "B룸",
        "price": "14,000원"
      },
      {
        "name": "C룸",
        "price": "14,000원"
      },
      {
        "name": "A룸",
        "price": "20,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1064404",
    "businessId": "1064404",
    "bizItemId": null
  },
  {
    "externalId": "studio-합정/홍대-하모닉스2호점",
    "name": "하모닉스2호점",
    "region": "합정/홍대",
    "address": "서울 마포구 동교로 190 지층",
    "priceRange": "8,000원~20,000원/시간",
    "openHours": "24시간",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "키보드",
      "마이크"
    ],
    "rooms": [
      {
        "name": "BLUE ROOM",
        "price": "17,000원"
      },
      {
        "name": "J ROOM",
        "price": "9,000원"
      },
      {
        "name": "MINI ROOM",
        "price": "8,000원"
      },
      {
        "name": "RED ROOM",
        "price": "20,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1278292",
    "businessId": "1278292",
    "bizItemId": null
  },
  {
    "externalId": "studio-합정/홍대-호랑이",
    "name": "호랑이",
    "region": "합정/홍대",
    "address": "서울 마포구 월드컵북로6길 57 지하1층",
    "priceRange": "17,000원~20,000원/시간",
    "openHours": "화~금 12:00~24:00 / 주말 11:00~24:00 / 월 18:00~24:00",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "키보드",
      "마이크"
    ],
    "rooms": [
      {
        "name": "호랑이2",
        "price": "17,000원"
      },
      {
        "name": "호랑이3",
        "price": "17,000원"
      },
      {
        "name": "호랑이1",
        "price": "20,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1062791",
    "businessId": "1062791",
    "bizItemId": null
  },
  {
    "externalId": "studio-합정/홍대-홍대리엠뮤직",
    "name": "홍대리엠뮤직",
    "region": "합정/홍대",
    "address": "서울 마포구 월드컵북로 64, B1",
    "priceRange": "14,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "합주실",
        "price": "14,000원/시간"
      }
    ],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-신촌-그라운드-신촌",
    "name": "그라운드 신촌",
    "region": "신촌",
    "address": "서울특별시 마포구 백범로1길 83, 지1층 비101호, 비102호",
    "priceRange": "12,000원~22,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "A룸",
        "price": "15,000원"
      },
      {
        "name": "B룸",
        "price": "13,000원"
      },
      {
        "name": "C룸",
        "price": "12,000원"
      },
      {
        "name": "S룸",
        "price": "22,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1182602",
    "businessId": "1182602",
    "bizItemId": null
  },
  {
    "externalId": "studio-신촌-드림",
    "name": "드림",
    "region": "신촌",
    "address": "서울시 서대문구 명물길 29-8, 지하1층",
    "priceRange": "12,000원~25,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "본점 A",
        "price": "18,000원"
      },
      {
        "name": "본점 B",
        "price": "17,000원"
      },
      {
        "name": "본점 C",
        "price": "14,000원"
      },
      {
        "name": "연대점 R",
        "price": "24,000원"
      },
      {
        "name": "연대점 Q",
        "price": "22,000원"
      },
      {
        "name": "연대점 F",
        "price": "15,000원"
      },
      {
        "name": "본점 V",
        "price": "24,000원"
      }
    ],
    "naverUrl": "https://www.xn--hy1bm6g6ujjkgomr.com/",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-신촌-라디오가가",
    "name": "라디오가가",
    "region": "신촌",
    "address": "서울특별시 마포구 신촌로16길 10",
    "priceRange": "13,000원~20,000원",
    "openHours": "운영시간 문의",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "마이크"
    ],
    "rooms": [
      {
        "name": "A룸",
        "price": "18,000원"
      },
      {
        "name": "B룸",
        "price": "16,000원"
      },
      {
        "name": "C룸",
        "price": "14,000원"
      },
      {
        "name": "D룸",
        "price": "14,000원"
      },
      {
        "name": "S룸",
        "price": "20,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1482133/items/6999756?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1482133",
    "bizItemId": "6999756"
  },
  {
    "externalId": "studio-신촌-신촌-그라운드",
    "name": "신촌 그라운드",
    "region": "신촌",
    "address": "서울특별시 마포구 신촌로12나길 29",
    "priceRange": "12,000원~17,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "B룸",
        "price": "12,000원"
      },
      {
        "name": "A룸",
        "price": "17,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1062814/items/5591709?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1062814",
    "bizItemId": "5591709"
  },
  {
    "externalId": "studio-신촌-신촌fms",
    "name": "신촌FMS",
    "region": "신촌",
    "address": "서울특별시 서대문구 연세로2마길 19, 백설사 세탁소 지하 자하브",
    "priceRange": "15,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-사당/이수-그루브-사당점",
    "name": "그루브 사당점",
    "region": "사당/이수",
    "address": "서울특별시 서초구 동작대로 68, 지하1층",
    "priceRange": "15,000원~22,000원/시간",
    "openHours": "07:00~익일03:00",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "B룸",
        "price": "20,000원"
      },
      {
        "name": "C룸",
        "price": "17,000원"
      },
      {
        "name": "D룸",
        "price": "15,000원"
      },
      {
        "name": "A룸",
        "price": "22,000원"
      }
    ],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-사당/이수-드림-사당1호점",
    "name": "드림 사당1호점",
    "region": "사당/이수",
    "address": "서울특별시 동작구 남부순환로271길 55, 지하1층",
    "priceRange": "12,000원~25,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "마이크"
    ],
    "rooms": [
      {
        "name": "사당1호점 S",
        "price": "23,000원"
      },
      {
        "name": "사당1호점 Q",
        "price": "21,000원"
      },
      {
        "name": "사당1호점 C",
        "price": "17,000원"
      },
      {
        "name": "사당1호점 D",
        "price": "12,000원"
      },
      {
        "name": "사당1호점 V",
        "price": "25,000원"
      }
    ],
    "naverUrl": "https://www.xn--hy1bm6g6ujjkgomr.com/",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-사당/이수-드림-사당2호점",
    "name": "드림 사당2호점",
    "region": "사당/이수",
    "address": "서울특별시 동작구 동작대로 13, 지층 1호",
    "priceRange": "12,000원~25,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "마이크"
    ],
    "rooms": [
      {
        "name": "사당2호점 2번방",
        "price": "26,000원"
      },
      {
        "name": "사당2호점 3번방",
        "price": "25,000원"
      },
      {
        "name": "사당2호점 4번방",
        "price": "22,000원"
      },
      {
        "name": "사당2호점 1번방",
        "price": "28,000원"
      }
    ],
    "naverUrl": "https://www.xn--hy1bm6g6ujjkgomr.com/",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-sadang_isu-드림-사당점",
    "name": "드림 사당점",
    "region": "사당/이수",
    "address": "서울특별시 동작구 남부순환로271길 55, 지하1층",
    "priceRange": "",
    "openHours": "",
    "amenities": [],
    "rooms": [
      {
        "name": "사당점 C",
        "price": ""
      },
      {
        "name": "사당점 D",
        "price": ""
      },
      {
        "name": "사당점 Q",
        "price": ""
      },
      {
        "name": "사당점 S",
        "price": ""
      },
      {
        "name": "사당점 V",
        "price": ""
      }
    ],
    "naverUrl": "https://www.xn--hy1bm6g6ujjkgomr.com/",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-사당/이수-비쥬1호점",
    "name": "비쥬1호점",
    "region": "사당/이수",
    "address": "서울특별시 서초구 동작대로 54-1, 지하 1층",
    "priceRange": "17,000원~22,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "화이트룸",
        "price": "17,000원"
      },
      {
        "name": "블랙룸",
        "price": "22,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/522011",
    "businessId": "522011",
    "bizItemId": null
  },
  {
    "externalId": "studio-사당/이수-비쥬2호점",
    "name": "비쥬2호점",
    "region": "사당/이수",
    "address": "서울특별시 서초구 동작대로 52, 지하1층",
    "priceRange": "23,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "B룸",
        "price": "23,000원"
      },
      {
        "name": "A룸",
        "price": "23,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/706924",
    "businessId": "706924",
    "bizItemId": null
  },
  {
    "externalId": "studio-사당/이수-비쥬3호점",
    "name": "비쥬3호점",
    "region": "사당/이수",
    "address": "서울특별시 서초구 동작대로 48, 지하1층",
    "priceRange": "25,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "M룸",
        "price": "25,000원"
      },
      {
        "name": "J룸",
        "price": "25,000원"
      },
      {
        "name": "C룸",
        "price": "25,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/917236",
    "businessId": "917236",
    "bizItemId": null
  },
  {
    "externalId": "studio-사당/이수-사운딕트",
    "name": "사운딕트",
    "region": "사당/이수",
    "address": "서울특별시 동작구 사당로30길 43, 지층",
    "priceRange": "15,000원~20,000원/시간",
    "openHours": "24시간",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "B룸",
        "price": "19,000원"
      },
      {
        "name": "C룸",
        "price": "18,000원"
      },
      {
        "name": "A룸",
        "price": "20,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1132767",
    "businessId": "1132767",
    "bizItemId": null
  },
  {
    "externalId": "studio-사당/이수-사운딕트2호점",
    "name": "사운딕트2호점",
    "region": "사당/이수",
    "address": "서울특별시 동작구 사당로30길 25, 지하2층 B201호",
    "priceRange": "가격 확인 필요",
    "openHours": "영업시간 확인 필요",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "마이크"
    ],
    "rooms": [
      {
        "name": "A ROOM",
        "price": ""
      },
      {
        "name": "B ROOM",
        "price": ""
      },
      {
        "name": "S ROOM",
        "price": ""
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1603022/items/7476895?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1603022",
    "bizItemId": "7476895"
  },
  {
    "externalId": "studio-사당/이수-에이타입사운드",
    "name": "에이타입사운드",
    "region": "사당/이수",
    "address": "서울특별시 동작구 사당로 281",
    "priceRange": "10,000원~18,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "라운지",
        "price": "18,000원"
      },
      {
        "name": "스테이지",
        "price": "18,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/838294",
    "businessId": "838294",
    "bizItemId": null
  },
  {
    "externalId": "studio-사당/이수-위드뮤직",
    "name": "위드뮤직",
    "region": "사당/이수",
    "address": "서울특별시 서초구 서초대로 31, 지하층",
    "priceRange": "22,000원~26,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "B룸",
        "price": "22,000원"
      },
      {
        "name": "A룸",
        "price": "26,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/773046",
    "businessId": "773046",
    "bizItemId": null
  },
  {
    "externalId": "studio-사당/이수-톤",
    "name": "톤",
    "region": "사당/이수",
    "address": "서울특별시 서초구 동작대로 108, 지하 4층",
    "priceRange": "24,000원",
    "openHours": "운영시간 문의",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "마이크"
    ],
    "rooms": [
      {
        "name": "A룸",
        "price": "24,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1374245/items/6614091?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1374245",
    "bizItemId": "6614091"
  },
  {
    "externalId": "studio-신도림/영등포구청-겟밴드-아지트",
    "name": "겟밴드 아지트",
    "region": "신도림/영등포구청",
    "address": "서울 영등포구 당산로 161, 지하 1층",
    "priceRange": "14,000원",
    "openHours": "24시간",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "겟밴드아지트",
        "price": "14,000원"
      },
      {
        "name": "기본룸",
        "price": ""
      }
    ],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-신도림/영등포구청-뮤지트",
    "name": "뮤지트",
    "region": "신도림/영등포구청",
    "address": "서울특별시 구로구 새말로16길 21, 지하1층",
    "priceRange": "15,000원~25,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "합주실",
        "price": "25,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1504370/items/7128673?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1504370",
    "bizItemId": "7128673"
  },
  {
    "externalId": "studio-신도림/영등포구청-일상",
    "name": "일상",
    "region": "신도림/영등포구청",
    "address": "서울특별시 구로구 공원로6나길 6, 지하1층",
    "priceRange": "13,000원~19,000원/시간",
    "openHours": "08:00~23:00",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "B룸",
        "price": "19,000원"
      },
      {
        "name": "C룸",
        "price": "15,000원"
      },
      {
        "name": "D룸",
        "price": "15,000원"
      },
      {
        "name": "A룸",
        "price": "19,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1400367/items/6702060?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1400367",
    "bizItemId": "6702060"
  },
  {
    "externalId": "studio-mangwon-3YL리허설",
    "name": "3YL리허설",
    "region": "망원",
    "address": "서울특별시 마포구 월드컵로25길 52, 지1층",
    "priceRange": "",
    "openHours": "",
    "amenities": [],
    "rooms": [
      {
        "name": "ROOM 1",
        "price": ""
      },
      {
        "name": "ROOM 2",
        "price": ""
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/759837/items/4601781?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "759837",
    "bizItemId": "4601781"
  },
  {
    "externalId": "studio-mangwon-알엠스튜디오",
    "name": "알엠스튜디오",
    "region": "망원",
    "address": "서울특별시 마포구 방울내로11길 26, 지1층",
    "priceRange": "",
    "openHours": "",
    "amenities": [],
    "rooms": [
      {
        "name": "A룸",
        "price": ""
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1500479/items/7071364?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1500479",
    "bizItemId": "7071364"
  },
  {
    "externalId": "studio-상도,중앙대-스페이스개러지-중앙대점",
    "name": "스페이스개러지 중앙대점",
    "region": "상도,중앙대",
    "address": "서울특별시 동작구 현충로 92, 지하1층",
    "priceRange": "13.000원~20,000원/시간",
    "openHours": "08:00~24:00",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "Room R",
        "price": "15,000원"
      },
      {
        "name": "Room X",
        "price": "13,000원"
      },
      {
        "name": "Room L",
        "price": "20,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1042278/items/5865609?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1042278",
    "bizItemId": "5865609"
  },
  {
    "externalId": "studio-상도,중앙대-위드제이",
    "name": "위드제이",
    "region": "상도,중앙대",
    "address": "서울특별시 동작구 장승배기로 8-1, 지층",
    "priceRange": "가격 문의",
    "openHours": "05:00~24:00",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "합주실",
        "price": "10,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1120335/items/5851692?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1120335",
    "bizItemId": "5851692"
  },
  {
    "externalId": "studio-상도,중앙대-준사운드",
    "name": "준사운드",
    "region": "상도,중앙대",
    "address": "서울특별시 동작구 양녕로 271, 지하1층",
    "priceRange": "가격 문의",
    "openHours": "24시간",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "B룸",
        "price": "20,000원"
      },
      {
        "name": "S룸",
        "price": "21,000원"
      },
      {
        "name": "A룸",
        "price": "22,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1384809/items/6649859?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1384809",
    "bizItemId": "6649859"
  },
  {
    "externalId": "studio-서울대입구-DOH음악스튜디오",
    "name": "DOH음악스튜디오",
    "region": "서울대입구",
    "address": "서울특별시 관악구 양녕로 19-1, 3층",
    "priceRange": "10,000원~16,000원/시간",
    "openHours": "05:00~24:00",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "라운지합주실",
        "price": "16,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1202079/items/6054832?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1202079",
    "bizItemId": "6054832"
  },
  {
    "externalId": "studio-서울대입구-길드합주실",
    "name": "길드합주실",
    "region": "서울대입구",
    "address": "서울특별시 관악구 낙성대로 12, 지하1층",
    "priceRange": "17,000원~22,000원/시간",
    "openHours": "24시간",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "유니크룸",
        "price": "19,000원"
      },
      {
        "name": "레어룸",
        "price": "17,000원"
      },
      {
        "name": "에픽룸",
        "price": "22,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1567821/items/7318663?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1567821",
    "bizItemId": "7318663"
  },
  {
    "externalId": "studio-서울대입구-모노합주실",
    "name": "모노합주실",
    "region": "서울대입구",
    "address": "서울특별시 관악구 봉천로 518-4, 4층",
    "priceRange": "22,000원",
    "openHours": "08:00~24:00",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "A룸",
        "price": "22,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1563307/items/7300112?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1563307",
    "bizItemId": "7300112"
  },
  {
    "externalId": "studio-서울대입구-브이엔앰스토리",
    "name": "브이엔앰스토리",
    "region": "서울대입구",
    "address": "서울특별시 관악구 중앙길 27, 지하1층",
    "priceRange": "25,000원/시간",
    "openHours": "09:00~22:00",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "Garage Music Studio 1",
        "price": "25,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/879630/items/5179359?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "879630",
    "bizItemId": "5179359"
  },
  {
    "externalId": "studio-방배-그루브-방배점",
    "name": "그루브 방배점",
    "region": "방배",
    "address": "서울특별시 서초구 효령로33길 23, 지하1층",
    "priceRange": "14,000으ㅏㄴ~17,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "2번방",
        "price": "17,000원"
      },
      {
        "name": "3번방",
        "price": "15,000원"
      },
      {
        "name": "4번방",
        "price": "14,000원"
      },
      {
        "name": "5번방",
        "price": "14,000원"
      },
      {
        "name": "1번방",
        "price": "17,000원"
      }
    ],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-방배-보고스튜디오",
    "name": "보고스튜디오",
    "region": "방배",
    "address": "서울특별시 서초구 방배로10길 18, 지하 101호",
    "priceRange": "20,000원",
    "openHours": "09:00~24:00",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "보고합주실",
        "price": "20,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1173895/items/5946156?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1173895",
    "bizItemId": "5946156"
  },
  {
    "externalId": "studio-방배-비쥬-방배점",
    "name": "비쥬 방배점",
    "region": "방배",
    "address": "서울특별시 서초구 방배로 60, 지층 1호",
    "priceRange": "20,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "2번룸",
        "price": "20,000원"
      },
      {
        "name": "3번룸",
        "price": "20,000원"
      },
      {
        "name": "4번룸",
        "price": "20,000원"
      },
      {
        "name": "5번룸",
        "price": "20,000원"
      },
      {
        "name": "6번룸",
        "price": "20,000원"
      },
      {
        "name": "7번룸",
        "price": "20,000원"
      },
      {
        "name": "1번룸",
        "price": "20,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1227688/items/6150469?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1227688",
    "bizItemId": "6150469"
  },
  {
    "externalId": "studio-혜화/성신여대-드림-대학로점",
    "name": "드림 대학로점",
    "region": "혜화/성신여대",
    "address": "서울특별시 종로구 대학로8가길 66, B1층",
    "priceRange": "13,000원~24,000원/시간",
    "openHours": "24시간",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "대학로 1호점 B",
        "price": "17,000원"
      },
      {
        "name": "대학로 1호점 C",
        "price": "17,000원"
      },
      {
        "name": "대학로 2호점 S",
        "price": "17,000원"
      },
      {
        "name": "대학로 2호점 R",
        "price": "17,000원"
      },
      {
        "name": "대학로 1호점 A",
        "price": "17,000원"
      }
    ],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-혜화/성신여대-드림-마로니에점",
    "name": "드림 마로니에점",
    "region": "혜화/성신여대",
    "address": "서울시 종로구 창경궁로 231, 지층",
    "priceRange": "21,000~29,000원/시간",
    "openHours": "24시간",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "마로니에 3호점 G",
        "price": "27,000원"
      },
      {
        "name": "마로니에 3호점 O",
        "price": "25,000원"
      },
      {
        "name": "마로니에 3호점 D",
        "price": "21,000원"
      },
      {
        "name": "마로니에 3호점 J",
        "price": "29,000원"
      }
    ],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-hyehwa_sungshin-룸디",
    "name": "룸디",
    "region": "혜화/성신여대",
    "address": "서울특별시 성북구 동소문로20가길 51, 5층",
    "priceRange": "",
    "openHours": "",
    "amenities": [],
    "rooms": [
      {
        "name": "Rehearsal Room A (심야)",
        "price": ""
      },
      {
        "name": "Rehearsal Room A (주/야간)",
        "price": ""
      },
      {
        "name": "Rehearsal Room B (심야)",
        "price": ""
      },
      {
        "name": "Rehearsal Room B (주/야간)",
        "price": ""
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1555966/items/7274727?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1555966",
    "bizItemId": "7274727"
  },
  {
    "externalId": "studio-혜화/성신여대-성북천-음악소",
    "name": "성북천 음악소",
    "region": "혜화/성신여대",
    "address": "서울 성북구 삼선동4가 18-3, 지하1층 성북천 음악소",
    "priceRange": "12,000원/시간",
    "openHours": "06:00~23:00",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "1번방",
        "price": "12,000원"
      }
    ],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-혜화/성신여대-세탁소아랫집",
    "name": "세탁소아랫집",
    "region": "혜화/성신여대",
    "address": "서울특별시 성북구 삼선교로14길 30, 지하 1층",
    "priceRange": "12,000원~25,000원",
    "openHours": "11:00~24:00",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "스튜디오",
        "price": "20,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/784413/items/4678539?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "784413",
    "bizItemId": "4678539"
  },
  {
    "externalId": "studio-혜화/성신여대-스페이스개러지-성신여대점",
    "name": "스페이스개러지 성신여대점",
    "region": "혜화/성신여대",
    "address": "서울특별시 성북구 동소문로22길 57-12, 지하1층",
    "priceRange": "13,000dnjs~18,000원/시간",
    "openHours": "24시간",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "Room R",
        "price": "15,000원"
      },
      {
        "name": "Room X",
        "price": "13,000원"
      },
      {
        "name": "Room L",
        "price": "18,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1577612/items/7357126?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1577612",
    "bizItemId": "7357126"
  },
  {
    "externalId": "studio-혜화/성신여대-영사운드",
    "name": "영사운드",
    "region": "혜화/성신여대",
    "address": "서울특별시 성북구 동소문로15길 8, 지층",
    "priceRange": "15,000원/시간",
    "openHours": "08:00~24:00",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "영사운드합주실",
        "price": "15,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1362561/items/6654617?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1362561",
    "bizItemId": "6654617"
  },
  {
    "externalId": "studio-강남-레드스튜디오",
    "name": "레드스튜디오",
    "region": "강남",
    "address": "서울 서초구 양재동 344, 지하 1층",
    "priceRange": "20,000원/시간",
    "openHours": "12:00~22:00",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "합주실",
        "price": "20,000원"
      }
    ],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-강남-리엠뮤직-강남",
    "name": "리엠뮤직 강남",
    "region": "강남",
    "address": "서울 강남구 언주로122길 34, B1",
    "priceRange": "22,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "리엠뮤직합주실",
        "price": "22,000원"
      }
    ],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-강남-엠플사운드",
    "name": "엠플사운드",
    "region": "강남",
    "address": "서울특별시 강남구 논현로 404 정안빌딩 B1",
    "priceRange": "18,000원~25,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "A2룸",
        "price": "25,000원"
      },
      {
        "name": "B1룸",
        "price": "23,000원"
      },
      {
        "name": "B2룸",
        "price": "23,000원"
      },
      {
        "name": "C룸",
        "price": "18,000원"
      },
      {
        "name": "A1룸",
        "price": "25,000원"
      }
    ],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-강남-파워하우스",
    "name": "파워하우스",
    "region": "강남",
    "address": "서울 강남구 논현로175길 107, 지하",
    "priceRange": "22,000원~44,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "Studio B",
        "price": "33,000원"
      },
      {
        "name": "Studio C",
        "price": "22,000원"
      },
      {
        "name": "Studio A",
        "price": "44,000원"
      }
    ],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-강동/송파-리엠뮤직-잠실",
    "name": "리엠뮤직 잠실",
    "region": "강동/송파",
    "address": "서울 송파구 백제고분로42길 20, B1",
    "priceRange": "22,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "리엠뮤직합주실",
        "price": "22,000원"
      }
    ],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-강동/송파-리튬",
    "name": "리튬",
    "region": "강동/송파",
    "address": "서울특별시 송파구 양재대로71길 28-22, 지하 1층",
    "priceRange": "20,000원/시간",
    "openHours": "24시간",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "Main Room",
        "price": ""
      },
      {
        "name": "메인룸",
        "price": "22,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1255568/items/6252193?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1255568",
    "bizItemId": "6252193"
  },
  {
    "externalId": "studio-강동/송파-브라더-강동",
    "name": "브라더 강동",
    "region": "강동/송파",
    "address": "서울특별시 강동구 성내로6길 32, 장성글로벌 지하1층",
    "priceRange": "19,500원~25,000원/시간",
    "openHours": "24시간",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "2번방",
        "price": "25,000원"
      },
      {
        "name": "5번방",
        "price": "25,000원"
      },
      {
        "name": "3번방",
        "price": "19,500원"
      },
      {
        "name": "4번방",
        "price": "19,500원"
      },
      {
        "name": "1번방",
        "price": "25,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1216066/items/6107148?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1216066",
    "bizItemId": "6107148"
  },
  {
    "externalId": "studio-강동/송파-브라더-송파",
    "name": "브라더 송파",
    "region": "강동/송파",
    "address": "서울특별시 송파구 위례성대로 52, 쌈지빌딩 지하1층",
    "priceRange": "15,000원~49,000원/시간",
    "openHours": "24시간",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "2번방",
        "price": "25,000원"
      },
      {
        "name": "3번방",
        "price": "25,000원"
      },
      {
        "name": "4번방",
        "price": "15,000원"
      },
      {
        "name": "라이브홀",
        "price": "49,000원"
      },
      {
        "name": "1번방",
        "price": "25,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1555383/items/7267309?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1555383",
    "bizItemId": "7267309"
  },
  {
    "externalId": "studio-강동/송파-스페이스블루",
    "name": "스페이스블루",
    "region": "강동/송파",
    "address": "서울 송파구 백제고분로 332, 지하1층 스페이스블루",
    "priceRange": "23,000원~30,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "대양홀",
        "price": "30,000원"
      }
    ],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-강동/송파-아지트",
    "name": "아지트",
    "region": "강동/송파",
    "address": "서울특별시 송파구 백제고분로9길 34, 아지트합주실",
    "priceRange": "16,000원~24,000원/시간",
    "openHours": "24시간",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "S room",
        "price": "21,000원"
      },
      {
        "name": "A room",
        "price": "18,000원"
      },
      {
        "name": "B room",
        "price": "16,000원"
      },
      {
        "name": "R room",
        "price": "24,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/574124/items/4064351?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "574124",
    "bizItemId": "4064351"
  },
  {
    "externalId": "studio-gangdong_songpa-호세네아지트",
    "name": "호세네아지트",
    "region": "강동/송파",
    "address": "서울특별시 송파구 백제고분로9길 34",
    "priceRange": "",
    "openHours": "",
    "amenities": [],
    "rooms": [
      {
        "name": "기본룸",
        "price": ""
      }
    ],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-기타-서울-그래비티",
    "name": "그래비티",
    "region": "기타 서울",
    "address": "서울특별시 중구 다산로14길 23, 지하1층",
    "priceRange": "17,000원~23,000원/시간",
    "openHours": "00:00~24:00",
    "amenities": [],
    "rooms": [
      {
        "name": "B룸",
        "price": "19,000원"
      },
      {
        "name": "C룸",
        "price": "17,000원"
      },
      {
        "name": "A룸",
        "price": "21,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1639811",
    "businessId": "1639811",
    "bizItemId": null
  },
  {
    "externalId": "studio-기타-서울-그루브-노원점",
    "name": "그루브 노원점",
    "region": "기타 서울",
    "address": "서울특별시 노원구 노해로 464, 지하1층",
    "priceRange": "14,000원~22,000원/시간",
    "openHours": "24시간",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "2번방",
        "price": "20,000원"
      },
      {
        "name": "3번방",
        "price": "17,000원"
      },
      {
        "name": "4번방",
        "price": "14,000원"
      },
      {
        "name": "5번방",
        "price": "14,000원"
      },
      {
        "name": "1번방",
        "price": "22,000원"
      }
    ],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-기타-서울-그루브합주실",
    "name": "그루브합주실",
    "region": "기타 서울",
    "address": "서울 중랑구 동일로 711 (상봉동), B1",
    "priceRange": "30,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "B룸",
        "price": "30,000원"
      }
    ],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-기타-서울-나인아트",
    "name": "나인아트",
    "region": "기타 서울",
    "address": "서울 중랑구 동일로101길 63, 2층 205호 NAWK STUDIO",
    "priceRange": "30,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-기타-서울-리엠뮤직-건대",
    "name": "리엠뮤직 건대",
    "region": "기타 서울",
    "address": "서울특별시 광진구 화양동 37-82, B1",
    "priceRange": "17,000원~22,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "2번방",
        "price": "17,000원"
      },
      {
        "name": "1번방",
        "price": "22.000원"
      }
    ],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-기타-서울-리엠뮤직-금호",
    "name": "리엠뮤직 금호",
    "region": "기타 서울",
    "address": "서울 성동구 장터길 15, B1",
    "priceRange": "17,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "리엠뮤직합주실",
        "price": "17,000원"
      }
    ],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-기타-서울-리엠뮤직-숙대입구",
    "name": "리엠뮤직 숙대입구",
    "region": "기타 서울",
    "address": "서울 용산구 후암동 164-6, B1",
    "priceRange": "22,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "리엠뮤직합주실",
        "price": "22,000원"
      }
    ],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-기타-서울-몰디브",
    "name": "몰디브",
    "region": "기타 서울",
    "address": "서울특별시 동대문구 망우로18가길 26, 지하1층",
    "priceRange": "20,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-기타-서울-백스테이지",
    "name": "백스테이지",
    "region": "기타 서울",
    "address": "서울 동작구 사당로27길 237, IADG빌딩 지하 1층",
    "priceRange": "16,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-기타-서울-브이앤엠",
    "name": "브이앤엠",
    "region": "기타 서울",
    "address": "서울특별시 관악구 중앙길 27, 지하1층",
    "priceRange": "25,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-기타 서울-사운드시티 방배점",
    "name": "사운드시티 방배점",
    "region": "기타 서울",
    "address": "서울특별시 서초구 효령로31길 48, 지층",
    "priceRange": "",
    "openHours": "",
    "amenities": [],
    "rooms": [
      {
        "name": "Room A",
        "price": ""
      },
      {
        "name": "Room B",
        "price": ""
      },
      {
        "name": "Room R",
        "price": ""
      },
      {
        "name": "Room S",
        "price": ""
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1593535/items/7422862?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1593535",
    "bizItemId": "7422862"
  },
  {
    "externalId": "studio-기타-서울-소리모아",
    "name": "소리모아",
    "region": "기타 서울",
    "address": "서울 은평구 가좌로 177",
    "priceRange": "15,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "합주실",
        "price": "15,000원"
      }
    ],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-기타-서울-스튜디오넘버원",
    "name": "스튜디오넘버원",
    "region": "기타 서울",
    "address": "서울 노원구 동일로183길 12-1, B1",
    "priceRange": "22,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-기타-서울-죠니의-리빙룸",
    "name": "죠니의 리빙룸",
    "region": "기타 서울",
    "address": "서울특별시 광진구 광나루로36길 71, B1층",
    "priceRange": "23,000원~25,000원/시간",
    "openHours": "10:00~24:00",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "죠니의 리빙룸",
        "price": "25,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1398524/items/6695118?area=bmp&lang=ko&map-search=1&service-target=map-pc&theme=place",
    "businessId": "1398524",
    "bizItemId": "6695118"
  },
  {
    "externalId": "studio-기타-서울-한스",
    "name": "한스",
    "region": "기타 서울",
    "address": "서울특별시 노원구 한글비석로 416, 지하1층",
    "priceRange": "11,000원~22,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [
      {
        "name": "B룸",
        "price": "17,000원"
      },
      {
        "name": "C룸",
        "price": "14,000원"
      },
      {
        "name": "A룸",
        "price": "25,000원"
      }
    ],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-기타-서울-헤르츠",
    "name": "헤르츠",
    "region": "기타 서울",
    "address": "서울특별시 관악구 신림동 1437-23, 지하1층 헤르츠스튜디오",
    "priceRange": "15,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "마이크"
    ],
    "rooms": [],
    "naverUrl": null,
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-부천-GAT음악동호회-범안점",
    "name": "GAT음악동호회 범안점",
    "region": "부천",
    "address": "경기 부천시 소사구 범안로 64",
    "priceRange": "멤버십·이용료 문의",
    "openHours": "24시간 · 이용 조건 문의",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크",
      "멤버십",
      "24시간"
    ],
    "rooms": [
      {
        "name": "밴드 합주실",
        "price": "문의"
      }
    ],
    "naverUrl": "https://m.place.naver.com/place/1763893146/home",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-부천-GAT음악동호회-중동점",
    "name": "GAT음악동호회 중동점",
    "region": "부천",
    "address": "경기 부천시 원미구 중동로 147",
    "priceRange": "멤버십·이용료 문의",
    "openHours": "12:00부터 · 상세 운영시간 문의",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크",
      "멤버십"
    ],
    "rooms": [
      {
        "name": "밴드 합주실",
        "price": "문의"
      }
    ],
    "naverUrl": "https://m.place.naver.com/place/490051422/home",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-부천-Music-m-Studio-TOP합주실",
    "name": "Music m Studio (TOP합주실)",
    "region": "부천",
    "address": "경기 부천시 원미구 신흥로 256, 지하",
    "priceRange": "10,000원/시간",
    "openHours": "예약 페이지 확인",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크",
      "스페이스클라우드"
    ],
    "rooms": [
      {
        "name": "Music m Studio",
        "price": "10,000원"
      }
    ],
    "naverUrl": "https://www.spacecloud.kr/host/atopmusic",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-부천-RnB스튜디오",
    "name": "RnB스튜디오",
    "region": "부천",
    "address": "경기 부천시 원미구 신흥로 228, 메디타워 지하1층",
    "priceRange": "15,000원/시간",
    "openHours": "12:00~22:00 · 주말/공휴일 휴무",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크",
      "정액권"
    ],
    "rooms": [
      {
        "name": "합주실",
        "price": "15,000원"
      }
    ],
    "naverUrl": "https://m.cafe.naver.com/rnbstudio",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-부천-도당예술마당-대연습실",
    "name": "도당예술마당 대연습실",
    "region": "부천",
    "address": "경기 부천시 원미구 부천로 360, 도당어울마당 5층",
    "priceRange": "무료 대관",
    "openHours": "월~금 10:00~17:00",
    "amenities": [
      "드럼",
      "건반",
      "마이크",
      "음향",
      "공공 대관"
    ],
    "rooms": [
      {
        "name": "대연습실",
        "price": "무료"
      }
    ],
    "naverUrl": "https://bcf.or.kr/bcc/rental/select?menuLevel=3&menuNo=102&siteKind=1",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-부천-뮤직스튜디오-놀자",
    "name": "뮤직스튜디오 놀자",
    "region": "부천",
    "address": "경기 부천시 원미구 원미로 66-1, 지하1층",
    "priceRange": "15,000원/시간",
    "openHours": "10:00부터 · 종료시간 문의",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크"
    ],
    "rooms": [
      {
        "name": "합주실",
        "price": "15,000원"
      }
    ],
    "naverUrl": "https://m.place.naver.com/place/1488207993/home",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-부천-뮤합주실",
    "name": "뮤합주실",
    "region": "부천",
    "address": "경기 부천시 원미구 부일로 414-7, 지하1층",
    "priceRange": "15,000원/시간",
    "openHours": "24시간",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크"
    ],
    "rooms": [
      {
        "name": "뮤 합주실",
        "price": "15,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1056575/items/5570580",
    "businessId": "1056575",
    "bizItemId": "5570580"
  },
  {
    "externalId": "studio-부천-소리공방-합주실",
    "name": "소리공방 합주실",
    "region": "부천",
    "address": "경기 부천시 원미구 옥산로 76, 지하1층",
    "priceRange": "25,000원/시간",
    "openHours": "09:00부터 · 종료시간 문의",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크"
    ],
    "rooms": [
      {
        "name": "합주실",
        "price": "25,000원"
      }
    ],
    "naverUrl": "https://m.place.naver.com/place/2024692317/home",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-부천-소사생활문화센터-밴드연습실",
    "name": "소사생활문화센터 밴드연습실",
    "region": "부천",
    "address": "경기 부천시 소사구 경인옛로 73, 소사어울마당 지하1층",
    "priceRange": "무료 대관",
    "openHours": "월~금 10:00~21:00 · 토 10:00~17:00",
    "amenities": [
      "드럼",
      "앰프",
      "건반",
      "마이크",
      "공공 대관"
    ],
    "rooms": [
      {
        "name": "마을방송국",
        "price": "무료"
      },
      {
        "name": "밴드연습실",
        "price": "무료"
      }
    ],
    "naverUrl": "https://www.bcf.or.kr/bcc/rental/select?menuLevel=3&menuNo=105&siteKind=4",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-부천-오정생활문화센터-밴드연습실",
    "name": "오정생활문화센터 밴드연습실",
    "region": "부천",
    "address": "경기 부천시 오정구 성오로 172, 오정아트홀 지하1층",
    "priceRange": "무료 대관",
    "openHours": "월~금 10:00~21:00 · 토 10:00~17:00",
    "amenities": [
      "드럼",
      "앰프",
      "건반",
      "마이크",
      "공공 대관"
    ],
    "rooms": [
      {
        "name": "밴드연습실",
        "price": "무료"
      }
    ],
    "naverUrl": "https://www.bcf.or.kr/bcc/rental/select?menuLevel=3&menuNo=104&siteKind=3",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-부천-준밴드-트레이닝",
    "name": "준밴드 트레이닝",
    "region": "부천",
    "address": "경기 부천시 원미구 역곡로 49, B101호 A실",
    "priceRange": "80,000원/월",
    "openHours": "10:00부터 · 프로그램 일정별 운영",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크",
      "프로그램형"
    ],
    "rooms": [
      {
        "name": "A실",
        "price": "80,000원/월"
      }
    ],
    "naverUrl": "https://m.place.naver.com/place/2027715267/home",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-부천-큐브합주실-부천2호점",
    "name": "큐브합주실 부천2호점",
    "region": "부천",
    "address": "경기 부천시 원미구 부천로30번길 17, 지하1층",
    "priceRange": "14,000원~16,000원/시간",
    "openHours": "24시간 · 연중무휴",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크",
      "악기 대여",
      "24시간"
    ],
    "rooms": [
      {
        "name": "DA ROOM",
        "price": "14,000원"
      },
      {
        "name": "GA ROOM",
        "price": "16,000원"
      },
      {
        "name": "NA ROOM",
        "price": "14,000원"
      }
    ],
    "naverUrl": "https://bub.searchroom.kr/web-index/detail/?rid=183&type=ensemble",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-부천-큐브합주실-송내4호점",
    "name": "큐브합주실 송내4호점",
    "region": "부천",
    "address": "경기 부천시 원미구 상일로122번길 43, 지하1층",
    "priceRange": "16,000원~18,000원/시간",
    "openHours": "24시간 · 연중무휴",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크",
      "24시간"
    ],
    "rooms": [
      {
        "name": "A ROOM",
        "price": "16,000원"
      },
      {
        "name": "S ROOM",
        "price": "18,000원"
      }
    ],
    "naverUrl": "https://bub.searchroom.kr/web-index/detail/?rid=182&type=ensemble",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-부평-FMS합주실",
    "name": "FMS합주실",
    "region": "부평",
    "address": "인천 부평구 길주로494번길 57",
    "priceRange": "15,000원/시간",
    "openHours": "24시간",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크",
      "24시간",
      "스페이스클라우드"
    ],
    "rooms": [
      {
        "name": "FMS 합주실",
        "price": "15,000원"
      }
    ],
    "naverUrl": "https://www.spacecloud.kr/space/23373",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-부평-뉴웨이브뮤직",
    "name": "뉴웨이브뮤직",
    "region": "부평",
    "address": "인천 부평구 신트리로 16, 지하1층",
    "priceRange": "20,000원/시간 · 월정액 220,000원",
    "openHours": "24시간",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크",
      "24시간",
      "정액권"
    ],
    "rooms": [
      {
        "name": "합주실",
        "price": "20,000원"
      }
    ],
    "naverUrl": "https://m.place.naver.com/place/1416535210/home",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-부평-뉴웨이브뮤직-부평구청2호점",
    "name": "뉴웨이브뮤직 부평구청2호점",
    "region": "부평",
    "address": "인천 부평구 주부토로151번길 41, 지하1층",
    "priceRange": "20,000원~22,000원/시간 · 월정액 200,000원~220,000원",
    "openHours": "24시간",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크",
      "24시간",
      "정액권"
    ],
    "rooms": [
      {
        "name": "합주실",
        "price": "평일 20,000원 · 주말 22,000원"
      }
    ],
    "naverUrl": "https://m.place.naver.com/place/2017482705/home",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-부평-몬스터스튜디오-합주실",
    "name": "몬스터스튜디오 합주실",
    "region": "부평",
    "address": "인천 부평구 마장로 354, 거성빌딩 지하1층",
    "priceRange": "12,000원~17,000원/시간",
    "openHours": "10:00~익일 05:00",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크",
      "녹음"
    ],
    "rooms": [
      {
        "name": "A룸",
        "price": "17,000원"
      },
      {
        "name": "B룸",
        "price": "12,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1077703/items/5642489",
    "businessId": "1077703",
    "bizItemId": "5642489"
  },
  {
    "externalId": "studio-부평-문화공간-음악마루",
    "name": "문화공간 음악마루",
    "region": "부평",
    "address": "인천 부평구 주부토로 236, 음악마루 1·2",
    "priceRange": "10,000원/시간",
    "openHours": "화~토 운영 · 일·월·공휴일 휴관",
    "amenities": [
      "드럼",
      "건반",
      "음향",
      "공공 대관"
    ],
    "rooms": [
      {
        "name": "음악마루 1",
        "price": "10,000원"
      },
      {
        "name": "음악마루 2",
        "price": "10,000원"
      }
    ],
    "naverUrl": "https://www.bpcf.or.kr/bpcf/bbs/BMSR00053/view.do?boardId=13001&menuNo=200142",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-부평-사운드루머",
    "name": "사운드루머",
    "region": "부평",
    "address": "인천 부평구 부평대로 230, B1층 B102호",
    "priceRange": "150,000원/월",
    "openHours": "24시간 · 정기팀 배정제",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크",
      "공연",
      "월정액",
      "24시간"
    ],
    "rooms": [
      {
        "name": "대형 합주·공연룸",
        "price": "150,000원/월"
      }
    ],
    "naverUrl": "https://m.place.naver.com/place/2014717516/home",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-부평-사운드뮤직-음악연습실",
    "name": "사운드뮤직 음악연습실",
    "region": "부평",
    "address": "인천 부평구 영성동로 40-1, 3층",
    "priceRange": "이용료 문의",
    "openHours": "매일 10:00~23:00",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크",
      "동호회"
    ],
    "rooms": [
      {
        "name": "밴드 합주실",
        "price": "문의"
      }
    ],
    "naverUrl": "https://www.114.co.kr/search/detail?comp_id=1374479&comp_tp_cd=INT&upjong_cd=871826",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-부평-인천음악창작소-포트락",
    "name": "인천음악창작소 포트락",
    "region": "부평",
    "address": "인천 부평구 경원대로 1299, 인천음악창작소 포트락",
    "priceRange": "5,000원~30,000원/시간",
    "openHours": "화~토 10:00~18:00 · 필요 시 22:00 연장 · 일·월·공휴일 휴무",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크",
      "녹음",
      "공공 대관"
    ],
    "rooms": [
      {
        "name": "스튜디오·리코딩 부스",
        "price": "30,000원"
      },
      {
        "name": "창작실1",
        "price": "5,000원"
      }
    ],
    "naverUrl": "https://www.portrock.kr/rental/application.html",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-부평-지앤디합주실",
    "name": "지앤디합주실",
    "region": "부평",
    "address": "인천 부평구 장제로 214, 3층",
    "priceRange": "13,000원~15,000원/시간",
    "openHours": "10:00~24:00",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "마이크"
    ],
    "rooms": [
      {
        "name": "대형룸",
        "price": "15,000원"
      },
      {
        "name": "소형룸",
        "price": "13,000원"
      }
    ],
    "naverUrl": "https://www.instagram.com/gnddrumschool/",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-부평-코지합주실",
    "name": "코지합주실",
    "region": "부평",
    "address": "인천 부평구 부평대로40번길 22, 지하1층",
    "priceRange": "15,000원/시간",
    "openHours": "10:00~22:00",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크"
    ],
    "rooms": [
      {
        "name": "합주실",
        "price": "15,000원"
      }
    ],
    "naverUrl": "https://m.place.naver.com/place/1899072221/home",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-부평-피치플레이스",
    "name": "피치플레이스",
    "region": "부평",
    "address": "인천 부평구 배곶로 18, 상용빌딩1 지하1층 1호",
    "priceRange": "15,000원/시간",
    "openHours": "11:00부터 · 종료시간 문의",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크",
      "녹음",
      "촬영"
    ],
    "rooms": [
      {
        "name": "합주실",
        "price": "15,000원"
      }
    ],
    "naverUrl": "https://m.place.naver.com/place/1248890199/home",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-수원-나인합주실",
    "name": "나인합주실",
    "region": "수원",
    "address": "경기 수원시 권선구 효원로190번길 11, 지하1층",
    "priceRange": "예약 채널 확인",
    "openHours": "24시간 · 사전 예약제",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크",
      "악기 대여"
    ],
    "rooms": [
      {
        "name": "A룸",
        "price": ""
      },
      {
        "name": "B룸",
        "price": ""
      },
      {
        "name": "C룸",
        "price": ""
      },
      {
        "name": "D룸",
        "price": ""
      }
    ],
    "naverUrl": "https://pf.kakao.com/_mLYlb",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-수원-줄라이-합주실-스튜디오",
    "name": "줄라이 합주실 스튜디오",
    "region": "수원",
    "address": "경기 수원시 장안구 율전로98번길 20, 지하1층",
    "priceRange": "16,000원/시간",
    "openHours": "24시간",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크"
    ],
    "rooms": [
      {
        "name": "합주실 대여",
        "price": "16,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1334544/items/6475152",
    "businessId": "1334544",
    "bizItemId": "6475152"
  },
  {
    "externalId": "studio-분당-107밴드센터",
    "name": "107밴드센터",
    "region": "분당",
    "address": "경기 성남시 분당구 느티로87번길 5-1, 지하1층",
    "priceRange": "30,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크",
      "디지털 믹서",
      "공연"
    ],
    "rooms": [
      {
        "name": "밴드센터",
        "price": "30,000원"
      }
    ],
    "naverUrl": "https://www.107music.com/band-centers",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-분당-분당-합주실",
    "name": "분당 합주실",
    "region": "분당",
    "address": "경기 성남시 분당구 성남대로 51, 지하1층 13호",
    "priceRange": "25,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크",
      "인이어 모니터"
    ],
    "rooms": [
      {
        "name": "분당 합주실",
        "price": "25,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1268865/items/6300696",
    "businessId": "1268865",
    "bizItemId": "6300696"
  },
  {
    "externalId": "studio-인천-라우드-뮤직스페이스",
    "name": "라우드 뮤직스페이스",
    "region": "인천",
    "address": "인천 계양구 주부토로 469, 지하1층",
    "priceRange": "12,000원~16,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크"
    ],
    "rooms": [
      {
        "name": "합주실 A룸",
        "price": "16,000원"
      },
      {
        "name": "합주실 B룸",
        "price": "12,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/343858/items/3393674",
    "businessId": "343858",
    "bizItemId": "3393674"
  },
  {
    "externalId": "studio-인천-레가토연수그루브",
    "name": "레가토연수그루브",
    "region": "인천",
    "address": "인천 연수구 연수동 611-3, 레가토연수그루브빌딩",
    "priceRange": "10,000원~15,000원/시간 · 대형룸 문의",
    "openHours": "운영시간 문의",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크",
      "공연",
      "녹음"
    ],
    "rooms": [
      {
        "name": "대형 합주실·공연장",
        "price": "문의"
      },
      {
        "name": "듀오 합주실",
        "price": "10,000원"
      },
      {
        "name": "중형 합주실",
        "price": "15,000원"
      }
    ],
    "naverUrl": "https://www.instagram.com/art_poel",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-일산-디알스튜디오",
    "name": "디알스튜디오",
    "region": "일산",
    "address": "경기 고양시 일산동구 백석로72번길 15, 지하1층",
    "priceRange": "25,000원/시간",
    "openHours": "운영시간 문의",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크",
      "녹음"
    ],
    "rooms": [
      {
        "name": "대형 합주실",
        "price": "25,000원"
      }
    ],
    "naverUrl": "https://open.kakao.com/o/shEyHtrb",
    "businessId": null,
    "bizItemId": null
  },
  {
    "externalId": "studio-일산-자인뮤직스튜디오",
    "name": "자인뮤직스튜디오",
    "region": "일산",
    "address": "경기 고양시 일산동구 강송로88번길 8-12, 지하1층",
    "priceRange": "25,000원/시간",
    "openHours": "10:00~22:00",
    "amenities": [
      "드럼",
      "기타앰프",
      "베이스앰프",
      "건반",
      "마이크"
    ],
    "rooms": [
      {
        "name": "단독합주실",
        "price": "25,000원"
      }
    ],
    "naverUrl": "https://m.booking.naver.com/booking/10/bizes/1275341/items/6321140",
    "businessId": "1275341",
    "bizItemId": "6321140"
  }
];
