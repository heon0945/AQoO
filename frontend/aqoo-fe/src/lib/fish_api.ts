export const fetchMyFish = async (userId: string, token: string) => {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_SERVER}/api/v1/users/${userId}`;

    const res = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error("유저 물고기 조회하기에 실패했습니다.");
    }

    return await res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};
