export const PAST_PAPERS_DRIVE_FOLDER_ID = '1pZOOInJtNUIHh8nje0g4RqHR8GxAJLB4';
export const PAST_PAPERS_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${PAST_PAPERS_DRIVE_FOLDER_ID}`;

export interface DriveExamPaperItem {
  id: string;
  name: string;
  code: string; // e.g. "0653/12", "0653/22"
  series: string; // e.g. "March 2026", "May/June 2026", "Oct/Nov 2025"
  paperNumber: 'Paper 1' | 'Paper 2' | 'Paper 4' | 'Paper 6' | 'Topical MCQ';
  tier: 'Core' | 'Extended' | 'Alternative to Practical';
  kind: 'Question Paper' | 'Mark Scheme' | 'Candidate Response';
  fileType: 'pdf' | 'pptx' | 'slides';
  driveViewUrl: string;
  driveDownloadUrl: string;
  linkedPartnerFileId?: string; // Links QP to MS or vice-versa
}

export const DRIVE_PAST_PAPERS_CATALOG: DriveExamPaperItem[] = [
  // -------------------------------------------------------------------------
  // March 2026 Series (m26) - Core & Extended MCQ
  // -------------------------------------------------------------------------
  {
    id: '10KuFIBic2VOIIHaeNlxx1c2fLB27yK9G',
    name: '0653_m26_qp_12.pdf',
    code: '0653/12',
    series: 'March 2026',
    paperNumber: 'Paper 1',
    tier: 'Core',
    kind: 'Question Paper',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/10KuFIBic2VOIIHaeNlxx1c2fLB27yK9G/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=10KuFIBic2VOIIHaeNlxx1c2fLB27yK9G&export=download',
    linkedPartnerFileId: '1nT6PXXv0qsl3LkT47dtgRqiy06SGtKdw'
  },
  {
    id: '1nT6PXXv0qsl3LkT47dtgRqiy06SGtKdw',
    name: '0653_m26_ms_12.pdf',
    code: '0653/12',
    series: 'March 2026',
    paperNumber: 'Paper 1',
    tier: 'Core',
    kind: 'Mark Scheme',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1nT6PXXv0qsl3LkT47dtgRqiy06SGtKdw/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1nT6PXXv0qsl3LkT47dtgRqiy06SGtKdw&export=download',
    linkedPartnerFileId: '10KuFIBic2VOIIHaeNlxx1c2fLB27yK9G'
  },
  {
    id: '16ul9-LDLPA3yn_21hOn8NS7E9cBzcfnK',
    name: '0653_m26_qp_22.pdf',
    code: '0653/22',
    series: 'March 2026',
    paperNumber: 'Paper 2',
    tier: 'Extended',
    kind: 'Question Paper',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/16ul9-LDLPA3yn_21hOn8NS7E9cBzcfnK/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=16ul9-LDLPA3yn_21hOn8NS7E9cBzcfnK&export=download',
    linkedPartnerFileId: '1yP-HmudrVe3EXfgjDpW0TdQ-c4gYWQuF'
  },
  {
    id: '1yP-HmudrVe3EXfgjDpW0TdQ-c4gYWQuF',
    name: '0653_m26_ms_22.pdf',
    code: '0653/22',
    series: 'March 2026',
    paperNumber: 'Paper 2',
    tier: 'Extended',
    kind: 'Mark Scheme',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1yP-HmudrVe3EXfgjDpW0TdQ-c4gYWQuF/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1yP-HmudrVe3EXfgjDpW0TdQ-c4gYWQuF&export=download',
    linkedPartnerFileId: '16ul9-LDLPA3yn_21hOn8NS7E9cBzcfnK'
  },

  // -------------------------------------------------------------------------
  // May/June 2026 Series (s26) - Core & Extended MCQ Variants
  // -------------------------------------------------------------------------
  {
    id: '1JUYASoNAcakufpnhkrHyS1nuB_nJarcv',
    name: '0653_s26_qp_11.pdf',
    code: '0653/11',
    series: 'May/June 2026',
    paperNumber: 'Paper 1',
    tier: 'Core',
    kind: 'Question Paper',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1JUYASoNAcakufpnhkrHyS1nuB_nJarcv/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1JUYASoNAcakufpnhkrHyS1nuB_nJarcv&export=download',
    linkedPartnerFileId: '1BMzR4N2emcPooM0A7gER-4XRprAs1643'
  },
  {
    id: '1BMzR4N2emcPooM0A7gER-4XRprAs1643',
    name: '0653_s26_ms_11.pdf',
    code: '0653/11',
    series: 'May/June 2026',
    paperNumber: 'Paper 1',
    tier: 'Core',
    kind: 'Mark Scheme',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1BMzR4N2emcPooM0A7gER-4XRprAs1643/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1BMzR4N2emcPooM0A7gER-4XRprAs1643&export=download',
    linkedPartnerFileId: '1JUYASoNAcakufpnhkrHyS1nuB_nJarcv'
  },
  {
    id: '1mXtPgKca0CI5jFJECmQ60MafmU3HHbBM',
    name: '0653_s26_qp_12.pdf',
    code: '0653/12',
    series: 'May/June 2026',
    paperNumber: 'Paper 1',
    tier: 'Core',
    kind: 'Question Paper',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1mXtPgKca0CI5jFJECmQ60MafmU3HHbBM/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1mXtPgKca0CI5jFJECmQ60MafmU3HHbBM&export=download',
    linkedPartnerFileId: '13fuiYPmOW6LMT84S4u2BmPIby3wHJoGj'
  },
  {
    id: '13fuiYPmOW6LMT84S4u2BmPIby3wHJoGj',
    name: '0653_s26_ms_12.pdf',
    code: '0653/12',
    series: 'May/June 2026',
    paperNumber: 'Paper 1',
    tier: 'Core',
    kind: 'Mark Scheme',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/13fuiYPmOW6LMT84S4u2BmPIby3wHJoGj/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=13fuiYPmOW6LMT84S4u2BmPIby3wHJoGj&export=download',
    linkedPartnerFileId: '1mXtPgKca0CI5jFJECmQ60MafmU3HHbBM'
  },
  {
    id: '1ocvi57HSne9Zk6bpbI6gWKmuWD9OmreE',
    name: '0653_s26_qp_13.pdf',
    code: '0653/13',
    series: 'May/June 2026',
    paperNumber: 'Paper 1',
    tier: 'Core',
    kind: 'Question Paper',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1ocvi57HSne9Zk6bpbI6gWKmuWD9OmreE/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1ocvi57HSne9Zk6bpbI6gWKmuWD9OmreE&export=download',
    linkedPartnerFileId: '1DO1BckSBENKpqMckv0o1McKXz3ojy3rl'
  },
  {
    id: '1DO1BckSBENKpqMckv0o1McKXz3ojy3rl',
    name: '0653_s26_ms_13.pdf',
    code: '0653/13',
    series: 'May/June 2026',
    paperNumber: 'Paper 1',
    tier: 'Core',
    kind: 'Mark Scheme',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1DO1BckSBENKpqMckv0o1McKXz3ojy3rl/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1DO1BckSBENKpqMckv0o1McKXz3ojy3rl&export=download',
    linkedPartnerFileId: '1ocvi57HSne9Zk6bpbI6gWKmuWD9OmreE'
  },
  {
    id: '1how3LCOn00agDUt-HBPA8PR1ExjO2fTk',
    name: '0653_s26_qp_21.pdf',
    code: '0653/21',
    series: 'May/June 2026',
    paperNumber: 'Paper 2',
    tier: 'Extended',
    kind: 'Question Paper',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1how3LCOn00agDUt-HBPA8PR1ExjO2fTk/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1how3LCOn00agDUt-HBPA8PR1ExjO2fTk&export=download',
    linkedPartnerFileId: '15jnH-niYKosHC8hUGO3xZ2K5oHijpoyf'
  },
  {
    id: '15jnH-niYKosHC8hUGO3xZ2K5oHijpoyf',
    name: '0653_s26_ms_21.pdf',
    code: '0653/21',
    series: 'May/June 2026',
    paperNumber: 'Paper 2',
    tier: 'Extended',
    kind: 'Mark Scheme',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/15jnH-niYKosHC8hUGO3xZ2K5oHijpoyf/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=15jnH-niYKosHC8hUGO3xZ2K5oHijpoyf&export=download',
    linkedPartnerFileId: '1how3LCOn00agDUt-HBPA8PR1ExjO2fTk'
  },
  {
    id: '1BTpTwE4duq7XGW6opg3aYtxKZ53nRiHb',
    name: '0653_s26_qp_22.pdf',
    code: '0653/22',
    series: 'May/June 2026',
    paperNumber: 'Paper 2',
    tier: 'Extended',
    kind: 'Question Paper',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1BTpTwE4duq7XGW6opg3aYtxKZ53nRiHb/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1BTpTwE4duq7XGW6opg3aYtxKZ53nRiHb&export=download',
    linkedPartnerFileId: '1VU2ZvmOzicd4CBRtx8lMXfCjn8HLgEEi'
  },
  {
    id: '1VU2ZvmOzicd4CBRtx8lMXfCjn8HLgEEi',
    name: '0653_s26_ms_22.pdf',
    code: '0653/22',
    series: 'May/June 2026',
    paperNumber: 'Paper 2',
    tier: 'Extended',
    kind: 'Mark Scheme',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1VU2ZvmOzicd4CBRtx8lMXfCjn8HLgEEi/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1VU2ZvmOzicd4CBRtx8lMXfCjn8HLgEEi&export=download',
    linkedPartnerFileId: '1BTpTwE4duq7XGW6opg3aYtxKZ53nRiHb'
  },
  {
    id: '1V2uI7PvefViDhVKZQ4ODfbITQffCbHwH',
    name: '0653_s26_qp_23.pdf',
    code: '0653/23',
    series: 'May/June 2026',
    paperNumber: 'Paper 2',
    tier: 'Extended',
    kind: 'Question Paper',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1V2uI7PvefViDhVKZQ4ODfbITQffCbHwH/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1V2uI7PvefViDhVKZQ4ODfbITQffCbHwH&export=download',
    linkedPartnerFileId: '1tDrVEwaVYcgl7KjjxsdDjqqr83nbCDbb'
  },
  {
    id: '1tDrVEwaVYcgl7KjjxsdDjqqr83nbCDbb',
    name: '0653_s26_ms_23.pdf',
    code: '0653/23',
    series: 'May/June 2026',
    paperNumber: 'Paper 2',
    tier: 'Extended',
    kind: 'Mark Scheme',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1tDrVEwaVYcgl7KjjxsdDjqqr83nbCDbb/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1tDrVEwaVYcgl7KjjxsdDjqqr83nbCDbb&export=download',
    linkedPartnerFileId: '1V2uI7PvefViDhVKZQ4ODfbITQffCbHwH'
  },

  // -------------------------------------------------------------------------
  // October/November 2025 Series (w25) - Core & Extended MCQ Variants
  // -------------------------------------------------------------------------
  {
    id: '1_KjWsIQnPk5JGzLVIF8qYjhSMjPMyAsD',
    name: '0653_w25_qp_11.pdf',
    code: '0653/11',
    series: 'Oct/Nov 2025',
    paperNumber: 'Paper 1',
    tier: 'Core',
    kind: 'Question Paper',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1_KjWsIQnPk5JGzLVIF8qYjhSMjPMyAsD/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1_KjWsIQnPk5JGzLVIF8qYjhSMjPMyAsD&export=download',
    linkedPartnerFileId: '10EwwunFdKMuHHZ5SdAeFWkBpw_-x2vWf'
  },
  {
    id: '10EwwunFdKMuHHZ5SdAeFWkBpw_-x2vWf',
    name: '0653_w25_ms_11.pdf',
    code: '0653/11',
    series: 'Oct/Nov 2025',
    paperNumber: 'Paper 1',
    tier: 'Core',
    kind: 'Mark Scheme',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/10EwwunFdKMuHHZ5SdAeFWkBpw_-x2vWf/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=10EwwunFdKMuHHZ5SdAeFWkBpw_-x2vWf&export=download',
    linkedPartnerFileId: '1_KjWsIQnPk5JGzLVIF8qYjhSMjPMyAsD'
  },
  {
    id: '1xBsW3LbDvobsfYGmp5xCbvGt2AxjZid-',
    name: '0653_w25_qp_12.pdf',
    code: '0653/12',
    series: 'Oct/Nov 2025',
    paperNumber: 'Paper 1',
    tier: 'Core',
    kind: 'Question Paper',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1xBsW3LbDvobsfYGmp5xCbvGt2AxjZid-/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1xBsW3LbDvobsfYGmp5xCbvGt2AxjZid-&export=download',
    linkedPartnerFileId: '1pOf6ozSWxDVxZmSAudTPs61N3KXcpAVx'
  },
  {
    id: '1pOf6ozSWxDVxZmSAudTPs61N3KXcpAVx',
    name: '0653_w25_ms_12.pdf',
    code: '0653/12',
    series: 'Oct/Nov 2025',
    paperNumber: 'Paper 1',
    tier: 'Core',
    kind: 'Mark Scheme',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1pOf6ozSWxDVxZmSAudTPs61N3KXcpAVx/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1pOf6ozSWxDVxZmSAudTPs61N3KXcpAVx&export=download',
    linkedPartnerFileId: '1xBsW3LbDvobsfYGmp5xCbvGt2AxjZid-'
  },
  {
    id: '1mAStxxFDnSOcJt5F0sDMuar5AnezqS0_',
    name: '0653_w25_qp_13.pdf',
    code: '0653/13',
    series: 'Oct/Nov 2025',
    paperNumber: 'Paper 1',
    tier: 'Core',
    kind: 'Question Paper',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1mAStxxFDnSOcJt5F0sDMuar5AnezqS0_/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1mAStxxFDnSOcJt5F0sDMuar5AnezqS0_&export=download',
    linkedPartnerFileId: '1sRkyY3lXJuQPp5xxGeT7sveRJ4528i0t'
  },
  {
    id: '1sRkyY3lXJuQPp5xxGeT7sveRJ4528i0t',
    name: '0653_w25_ms_13.pdf',
    code: '0653/13',
    series: 'Oct/Nov 2025',
    paperNumber: 'Paper 1',
    tier: 'Core',
    kind: 'Mark Scheme',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1sRkyY3lXJuQPp5xxGeT7sveRJ4528i0t/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1sRkyY3lXJuQPp5xxGeT7sveRJ4528i0t&export=download',
    linkedPartnerFileId: '1mAStxxFDnSOcJt5F0sDMuar5AnezqS0_'
  },
  {
    id: '1NTM4Ukj95C9PUpl-ilvo0zWaa_1xCHV6',
    name: '0653_w25_qp_21.pdf',
    code: '0653/21',
    series: 'Oct/Nov 2025',
    paperNumber: 'Paper 2',
    tier: 'Extended',
    kind: 'Question Paper',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1NTM4Ukj95C9PUpl-ilvo0zWaa_1xCHV6/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1NTM4Ukj95C9PUpl-ilvo0zWaa_1xCHV6&export=download',
    linkedPartnerFileId: '1bI3t1D3pe3CsC9voR6iPnTpfyWXIlQHN'
  },
  {
    id: '1bI3t1D3pe3CsC9voR6iPnTpfyWXIlQHN',
    name: '0653_w25_ms_21.pdf',
    code: '0653/21',
    series: 'Oct/Nov 2025',
    paperNumber: 'Paper 2',
    tier: 'Extended',
    kind: 'Mark Scheme',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1bI3t1D3pe3CsC9voR6iPnTpfyWXIlQHN/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1bI3t1D3pe3CsC9voR6iPnTpfyWXIlQHN&export=download',
    linkedPartnerFileId: '1NTM4Ukj95C9PUpl-ilvo0zWaa_1xCHV6'
  },
  {
    id: '10XB1Sbdm6_XMMAdKw0Tp3-xpIx7mghJV',
    name: '0653_w25_qp_22.pdf',
    code: '0653/22',
    series: 'Oct/Nov 2025',
    paperNumber: 'Paper 2',
    tier: 'Extended',
    kind: 'Question Paper',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/10XB1Sbdm6_XMMAdKw0Tp3-xpIx7mghJV/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=10XB1Sbdm6_XMMAdKw0Tp3-xpIx7mghJV&export=download',
    linkedPartnerFileId: '1gxFEvPrrlnvM4UUPQ7bzhOzjYsk8uUNC'
  },
  {
    id: '1gxFEvPrrlnvM4UUPQ7bzhOzjYsk8uUNC',
    name: '0653_w25_ms_22.pdf',
    code: '0653/22',
    series: 'Oct/Nov 2025',
    paperNumber: 'Paper 2',
    tier: 'Extended',
    kind: 'Mark Scheme',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1gxFEvPrrlnvM4UUPQ7bzhOzjYsk8uUNC/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1gxFEvPrrlnvM4UUPQ7bzhOzjYsk8uUNC&export=download',
    linkedPartnerFileId: '10XB1Sbdm6_XMMAdKw0Tp3-xpIx7mghJV'
  },
  {
    id: '1sAc_LzOnqGRAp8HhyOzX_XilranxLU20',
    name: '0653_w25_qp_23.pdf',
    code: '0653/23',
    series: 'Oct/Nov 2025',
    paperNumber: 'Paper 2',
    tier: 'Extended',
    kind: 'Question Paper',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1sAc_LzOnqGRAp8HhyOzX_XilranxLU20/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1sAc_LzOnqGRAp8HhyOzX_XilranxLU20&export=download',
    linkedPartnerFileId: '1mwe1zaQ_DVHxmAuClaZmnv09ncnc_L_m'
  },
  {
    id: '1mwe1zaQ_DVHxmAuClaZmnv09ncnc_L_m',
    name: '0653_w25_ms_23.pdf',
    code: '0653/23',
    series: 'Oct/Nov 2025',
    paperNumber: 'Paper 2',
    tier: 'Extended',
    kind: 'Mark Scheme',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1mwe1zaQ_DVHxmAuClaZmnv09ncnc_L_m/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1mwe1zaQ_DVHxmAuClaZmnv09ncnc_L_m&export=download',
    linkedPartnerFileId: '1sAc_LzOnqGRAp8HhyOzX_XilranxLU20'
  },

  // -------------------------------------------------------------------------
  // Topical & Extended MCQ Packs
  // -------------------------------------------------------------------------
  {
    id: '1EmafaMS45IqkkKed0uRAJiw_eyYSCuZz',
    name: 'MCQ 2024 extended.pdf',
    code: '0653/MCQ-1',
    series: '2024 Compilation',
    paperNumber: 'Topical MCQ',
    tier: 'Extended',
    kind: 'Question Paper',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1EmafaMS45IqkkKed0uRAJiw_eyYSCuZz/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1EmafaMS45IqkkKed0uRAJiw_eyYSCuZz&export=download'
  },
  {
    id: '1qlPYFmOt7Bfl1Xckon2idr72UDuaxaRG',
    name: 'MCQ 2024 extended 2.pdf',
    code: '0653/MCQ-2',
    series: '2024 Compilation',
    paperNumber: 'Topical MCQ',
    tier: 'Extended',
    kind: 'Question Paper',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1qlPYFmOt7Bfl1Xckon2idr72UDuaxaRG/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1qlPYFmOt7Bfl1Xckon2idr72UDuaxaRG&export=download'
  },
  {
    id: '1oAWKpcugOE45JCt8rZRbSCEuSp-4PDHe',
    name: 'MCQ 2024 extended 3.pdf',
    code: '0653/MCQ-3',
    series: '2024 Compilation',
    paperNumber: 'Topical MCQ',
    tier: 'Extended',
    kind: 'Question Paper',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1oAWKpcugOE45JCt8rZRbSCEuSp-4PDHe/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1oAWKpcugOE45JCt8rZRbSCEuSp-4PDHe&export=download'
  },
  {
    id: '1lYhf_8igOzvkZ9bxcI7bvn31Ks_vBj_d',
    name: 'MCQ 2024 extended 4.pdf',
    code: '0653/MCQ-4',
    series: '2024 Compilation',
    paperNumber: 'Topical MCQ',
    tier: 'Extended',
    kind: 'Question Paper',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1lYhf_8igOzvkZ9bxcI7bvn31Ks_vBj_d/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1lYhf_8igOzvkZ9bxcI7bvn31Ks_vBj_d&export=download'
  },
  {
    id: '1GJVRVn78EyN-0Yc8ke5zk3dJGTuKmLn0',
    name: 'MCQ 2024 extended 5.pdf',
    code: '0653/MCQ-5',
    series: '2024 Compilation',
    paperNumber: 'Topical MCQ',
    tier: 'Extended',
    kind: 'Question Paper',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1GJVRVn78EyN-0Yc8ke5zk3dJGTuKmLn0/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1GJVRVn78EyN-0Yc8ke5zk3dJGTuKmLn0&export=download'
  },
  {
    id: '1vTn5PPs6lXC4OVndaTodEif78rghtctH',
    name: 'MCQ 2024 extended 6.pdf',
    code: '0653/MCQ-6',
    series: '2024 Compilation',
    paperNumber: 'Topical MCQ',
    tier: 'Extended',
    kind: 'Question Paper',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1vTn5PPs6lXC4OVndaTodEif78rghtctH/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1vTn5PPs6lXC4OVndaTodEif78rghtctH&export=download'
  },
  {
    id: '1AShJ8Z3KQTRCExYhNAwExf82EHxLw7oW',
    name: 'MCQ 2024 extended 7.pdf',
    code: '0653/MCQ-7',
    series: '2024 Compilation',
    paperNumber: 'Topical MCQ',
    tier: 'Extended',
    kind: 'Question Paper',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1AShJ8Z3KQTRCExYhNAwExf82EHxLw7oW/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1AShJ8Z3KQTRCExYhNAwExf82EHxLw7oW&export=download'
  },
  {
    id: '1DF69OIMXyXAPa48sPfENohZEJ4xOuS4r',
    name: 'MCQ 2024 extended 8.pdf',
    code: '0653/MCQ-8',
    series: '2024 Compilation',
    paperNumber: 'Topical MCQ',
    tier: 'Extended',
    kind: 'Question Paper',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1DF69OIMXyXAPa48sPfENohZEJ4xOuS4r/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1DF69OIMXyXAPa48sPfENohZEJ4xOuS4r&export=download'
  },

  // -------------------------------------------------------------------------
  // Specimen & Core 2026 Examination Papers
  // -------------------------------------------------------------------------
  {
    id: '1bTA5ZekGBN9IZ03cBvTPXMKvWzzNkJcx',
    name: '0653 Science - Combined 2025 Specimen Question Paper 2.pdf',
    code: '0653/02',
    series: 'Specimen 2025',
    paperNumber: 'Paper 2',
    tier: 'Extended',
    kind: 'Question Paper',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1bTA5ZekGBN9IZ03cBvTPXMKvWzzNkJcx/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1bTA5ZekGBN9IZ03cBvTPXMKvWzzNkJcx&export=download',
    linkedPartnerFileId: '1U08NxUwVyF3a6X_mdpwMzc6cEUcSLQMN'
  },
  {
    id: '1U08NxUwVyF3a6X_mdpwMzc6cEUcSLQMN',
    name: '0653 Science - Combined 2025 Specimen Mark Scheme 2.pdf',
    code: '0653/02',
    series: 'Specimen 2025',
    paperNumber: 'Paper 2',
    tier: 'Extended',
    kind: 'Mark Scheme',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1U08NxUwVyF3a6X_mdpwMzc6cEUcSLQMN/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1U08NxUwVyF3a6X_mdpwMzc6cEUcSLQMN&export=download',
    linkedPartnerFileId: '1bTA5ZekGBN9IZ03cBvTPXMKvWzzNkJcx'
  },
  {
    id: '1_fWzp10i3LSkoNCzVYUf5ejLUgyiD1b8',
    name: 'Multiple Choice (Core) 2026 - Mark Scheme.pdf',
    code: '0653/01',
    series: '2026 Series',
    paperNumber: 'Paper 1',
    tier: 'Core',
    kind: 'Mark Scheme',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1_fWzp10i3LSkoNCzVYUf5ejLUgyiD1b8/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1_fWzp10i3LSkoNCzVYUf5ejLUgyiD1b8&export=download'
  },
  {
    id: '13rkiW9qDLvbaEiUlEevLhdvGyf97eKTu',
    name: 'Alternative to Practical 2026 - Question Paper.pdf',
    code: '0653/61',
    series: 'May/June 2026',
    paperNumber: 'Paper 6',
    tier: 'Alternative to Practical',
    kind: 'Question Paper',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/13rkiW9qDLvbaEiUlEevLhdvGyf97eKTu/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=13rkiW9qDLvbaEiUlEevLhdvGyf97eKTu&export=download',
    linkedPartnerFileId: '1nIsIKsPs2qTNwV-fl9XIHHlAX5AkPjLJ'
  },
  {
    id: '1nIsIKsPs2qTNwV-fl9XIHHlAX5AkPjLJ',
    name: 'Alternative to Practical 2026 - Mark Scheme.pdf',
    code: '0653/61',
    series: 'May/June 2026',
    paperNumber: 'Paper 6',
    tier: 'Alternative to Practical',
    kind: 'Mark Scheme',
    fileType: 'pdf',
    driveViewUrl: 'https://drive.google.com/file/d/1nIsIKsPs2qTNwV-fl9XIHHlAX5AkPjLJ/view',
    driveDownloadUrl: 'https://drive.usercontent.google.com/download?id=1nIsIKsPs2qTNwV-fl9XIHHlAX5AkPjLJ&export=download',
    linkedPartnerFileId: '13rkiW9qDLvbaEiUlEevLhdvGyf97eKTu'
  }
];
