"use client";

import Image from "next/image";
import styles from "@/styles/mypage.module.css";
import { useState } from "react";

export default function MyPage() {
  const [selectedTab, setSelectecTab] = useState("one");
  return (
    <div className={styles.main}>
      <div className={styles["buttons-bg"]}>
        <button className={styles.btn}>Home</button>
        <button className={styles.btn}>Logout</button>
      </div>
      <div className={styles["myPage-container"]}>
        <div className={styles.myInfo}>
          <div className={styles["left-content"]}>
            <div className={styles.portrait}>
              <div className={styles["inner-portrait"]}>
                <Image
                  src="/images/대표이미지샘플.png"
                  alt="대표 이미지"
                  width={130}
                  height={130}
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
            <div className={styles["infotext-box"]}>
              <p className={styles.infotext}>레벨: 1234</p>
              <p className={styles.infotext}>닉네임: 회사랑김싸피</p>
              <p className={styles.infotext}>총 물고기 갯수: 100 마리</p>
            </div>
          </div>
          <div className={styles["button-myInfo"]}>
            <button className={styles.btn}>회원정보수정</button>
          </div>
        </div>

        <div className={styles.wrapper}>
          <div>
            <button
              className={`${styles.tab} ${selectedTab === "one" ? styles.active : ""} `}
              onClick={() => setSelectecTab("one")}
            >
              도감관리
            </button>
            <button
              className={`${styles.tab} ${selectedTab === "two" ? styles.active : ""} `}
              onClick={() => setSelectecTab("two")}
            >
              커스텀
            </button>
          </div>
          <button className={`${styles.btn} ${styles["go-to-fishtank"]}`}>어항관리</button>
          <div className={styles["fishList-container"]}>
            <div className={styles.fishList}>
              <div className={styles.panels}>
                {selectedTab === "one" && (
                  <div className={`${styles.panel} ${styles["one-panel"]}`} id="one-panel">
                    <div className={`${styles["panel-title"]} ${styles.portrait}`}>
                      <p>도감관리</p>
                      <div className={styles["inner-portrait"]}>
                        <Image
                          src="/images/대표이미지샘플.png"
                          alt="대표 이미지"
                          width={130}
                          height={130}
                          style={{ objectFit: "cover" }}
                        />{" "}
                      </div>
                    </div>
                  </div>
                )}
                {selectedTab === "two" && (
                  <div className={`${styles.panel} ${styles["two-panel"]}`}>
                    <div className={`${styles["panel-title"]} ${styles.portrait}`}>
                      <p>커스텀</p>
                      <div className={styles["inner-portrait"]}>
                        <Image
                          src="/images/대표이미지샘플.png"
                          alt="대표 이미지"
                          width={130}
                          height={130}
                          style={{ objectFit: "cover" }}
                        />{" "}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
