module.exports = {
  categories: [
    {
      id: 'c-1',
      type: 'category',
      label: '目录一',
      items: [{"$ref": 1}, {"$ref": 2}, {"$ref": 3}]
    }, {
      id: 'c-2',
      type: 'category',
      label: '目录二',
      items: [{"$ref": 6}]
    }, {
      id: 'c-3',
      type: 'category',
      label: '目录三',
      items: [
        {"$ref": 'c-4'}, {"$ref": 4}, {"$ref": 5}, {"$ref": 7}
      ]
    },
    {
      id: 'c-4',
      type: 'category',
      label: '目录三的子目录',
      items: [{"$ref": 1}, {"$ref": 2}]
    }
  ],
  books: [
    {
      id: 1,
      type: 'book',
      label: '书一'
    }, {
      id: 2,
      type: 'book',
      label: '书二'
    }, {
      id: 3,
      type: 'book',
      label: '书三'
    }, {
      id: 4,
      type: 'book',
      label: '书四'
    },
    {
      id: 5,
      type: 'book',
      label: '书五'
    }, {
      id: 6,
      type: 'book',
      label: '红楼梦',
    }, {
      id: 7,
      type: 'book',
      label: '三国演义'
    }
  ]
};
