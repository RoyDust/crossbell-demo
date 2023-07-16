"use client";

import React, { memo, useEffect, useState } from "react";
import {
  useConnectedAccount,
  useNoteLikeCount,
  usePostNote,
  useNoteLikeList,
} from "@crossbell/connect-kit";
import { CharacterAvatar, LoadMore } from "@crossbell/ui";
import { useNoteStatus, indexer } from "@crossbell/indexer";
import style from "./style.module.scss";
// 没有封装时间工具
import dayjs from "dayjs";

const Note = () => {
  const account = useConnectedAccount();
  let [noteList, setNodeList]: [any[], Function] = useState([]);
  const format = "YYYY-MM-DD HH:mm:ss"; //定义时间格式

  const postNote = usePostNote();
  let [inputData, setInputData] = useState("");

  // 获取喜欢的人list - 测试hooks
  const [list, { fetchNextPage, hasNextPage, isFetchingNextPage }] =
    useNoteLikeList({
      // https://xfeed.app/notes/32179-30
      noteId: 30,
      characterId: 32179,
    });

  // 获取喜欢数
  const { data: likeCount } = useNoteLikeCount({
    // https://xfeed.app/notes/32179-30
    noteId: 30,
    characterId: 32179,
  });

  // 获取信息
  const getData = async () => {
    console.log(list);
    console.log(likeCount);
    const data = await indexer.note.getMany({
      characterId: account?.characterId,
    });
    getUserInfo(data.list);
    // setNodeList(data.list as []);
  };

  // 获取个人信息
  const getUserInfo = async (noteList: any[]) => {
    const newList: any[] = noteList;

    for (let i = 0; i < noteList.length; i++) {
      const result = await indexer.character.get(noteList[i].characterId);
      newList[i].userInfo = result;
    }
    console.log(newList);
    setNodeList(newList);
  };

  useEffect(() => {
    getData();
  }, [noteList]);

  // 发表博客 简化了发表平台选择默认是xFeed
  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputData(event.target.value);
  };

  // 路由转跳
  const handleJump = (item: any) => {
    console.log(item);
    const characterId = item.characterId;
    const noteId = item.noteId;
    window.location.href = `https://xfeed.app/notes/${characterId}-${noteId}`;
  };

  return (
    <div className={style.box}>
      <div className={style.postNote}>
        <input
          type="text"
          onChange={(e) => handleInput(e)}
          className={style.textInput}
        />
        <button
          className={style.sendBnt}
          onClick={() => {
            postNote.mutate({
              metadata: {
                content: inputData,
                sources: ["xFeed"],
                external_urls: ["https://crossbell.io"],
                tags: ["post"],
              },
            });
          }}
        >
          发送Note
        </button>
      </div>

      <div className={style.noteWrapper}>
        {noteList.map((item: any, index: number) => {
          return (
            <div
              className={style.noteBox}
              key={index}
              onClick={(e) => handleJump(item)}
            >
              <header className={style.noteHeader}>
                <CharacterAvatar size="48px" characterId={item.characterId} />
                <div className={style.userNameBox}>
                  <div className={style.userId}>
                    @{item.userInfo?.handle || undefined}
                  </div>
                  <div className={style.userName}>
                    {item.userInfo?.metadata.content.name || undefined}
                  </div>
                </div>
                <div className={style.postTime}>
                  {dayjs(item.publishedAt).format(format)}
                </div>
              </header>
              <main
                className={style.content}
                dangerouslySetInnerHTML={{
                  __html: item.metadata.content.content,
                }}
              ></main>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Note;
